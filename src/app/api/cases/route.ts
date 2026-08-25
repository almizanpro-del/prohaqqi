import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/** GET /api/cases — every case I own or am an active member of. */
export async function GET(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ cases: [] });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getServerSupabase()!;

  const [{ data: owned }, { data: shared }] = await Promise.all([
    db.from("cases").select("*").eq("created_by", user.id).order("created_at", { ascending: false }),
    db
      .from("case_access")
      .select("role,cases(*)")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  type CaseRow = Record<string, unknown> & { id: string };
  const map = new Map<string, { case: CaseRow; role: string }>();
  for (const c of (owned ?? []) as unknown as CaseRow[]) map.set(c.id, { case: c, role: "owner" });
  for (const row of (shared ?? []) as unknown as Array<{ role: string; cases: CaseRow | null }>) {
    if (row.cases && !map.has(row.cases.id)) map.set(row.cases.id, { case: row.cases, role: row.role });
  }

  return NextResponse.json({
    cases: Array.from(map.values()).map(({ case: c, role }) => ({ ...c, my_role: role })),
  });
}

/** POST /api/cases — create a case, owner access row and auto deadlines. */
export async function POST(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ error: "db_not_configured" }, { status: 501 });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const label = String(body.label ?? "").trim().slice(0, 160);
  const accidentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.accident_date ?? ""))
    ? String(body.accident_date)
    : null;
  const injuries = ["none", "minor", "severe", "death"].includes(String(body.injuries))
    ? String(body.injuries)
    : "none";
  if (!accidentDate) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;

  const { data: created, error } = await db
    .from("cases")
    .insert({ created_by: user.id, label, accident_date: accidentDate, injuries })
    .select()
    .single();
  if (error || !created)
    return NextResponse.json({ error: error?.message ?? "insert_failed" }, { status: 500 });

  await db.from("case_access").insert({
    case_id: created.id,
    user_id: user.id,
    email: user.email,
    role: "owner",
    status: "active",
    granted_by: user.id,
  });

  // Hard legal deadlines: 3y limitation (Art. 932) + 1y Fund window.
  const plus = (iso: string, days: number) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  await db.from("deadlines").insert([
    { case_id: created.id, kind: "limitation_3y", due_date: plus(accidentDate, 3 * 365), created_by: user.id },
    { case_id: created.id, kind: "fund_1y", due_date: plus(accidentDate, 365), created_by: user.id },
  ]);

  await db.from("notifications").insert({
    user_id: user.id,
    kind: "case_created",
    title_ar: "تم إنشاء حالتك — ابدأ بتتبع المواعيد النهائية.",
    title_en: "Your case was created — start tracking hard deadlines.",
    payload: { case_id: created.id },
  });

  return NextResponse.json({ case: created });
}
