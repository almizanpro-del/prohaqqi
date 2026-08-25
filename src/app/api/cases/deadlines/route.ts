import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/** GET ?case_id=… */
export async function GET(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ deadlines: [] });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const caseId = new URL(req.url).searchParams.get("case_id");
  if (!caseId) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { data, error } = await db
    .from("deadlines")
    .select("*")
    .eq("case_id", caseId)
    .order("due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deadlines: data ?? [] });
}

/** POST { case_id, title, due_date } — custom deadline. */
export async function POST(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = String(body.case_id ?? "");
  const title = String(body.title ?? "").trim().slice(0, 200);
  const due = String(body.due_date ?? "");
  if (!caseId || !title || !/^\d{4}-\d{2}-\d{2}$/.test(due))
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { data, error } = await db
    .from("deadlines")
    .insert({ case_id: caseId, kind: "custom", title, due_date: due, created_by: user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deadline: data });
}

/** PATCH { id, completed } */
export async function PATCH(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const completed = body.completed === true;
  if (!id) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { error } = await db
    .from("deadlines")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
