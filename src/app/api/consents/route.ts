import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/** POST /api/consents — versioned consent records (PDPL + disclaimer defense). */
export async function POST(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const docs = Array.isArray(body.docs) ? body.docs : [];
  if (!docs.length) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const rows = docs
    .filter((d: Record<string, unknown>) =>
      ["terms", "privacy", "disclaimer"].includes(String(d.doc)) && Number(d.version) > 0
    )
    .map((d: Record<string, unknown>) => ({
      auth_user_id: user.id,
      consent_type: String(d.doc),
      doc_type: String(d.doc),
      doc_version: Number(d.version),
      granted: true,
      ip_address: req.headers.get("x-forwarded-for") ?? null,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    }));

  if (!rows.length) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const db = getServerSupabase()!;
  await db.from("user_consents").insert(rows);
  return NextResponse.json({ ok: true });
}
