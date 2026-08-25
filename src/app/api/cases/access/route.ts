import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

async function assertOwner(db: NonNullable<ReturnType<typeof getServerSupabase>>, caseId: string, uid: string) {
  const { data } = await db.from("cases").select("id").eq("id", caseId).eq("created_by", uid).maybeSingle();
  return Boolean(data);
}

/** GET ?case_id=… | scope=mine_invites */
export async function GET(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ access: [] });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getServerSupabase()!;
  const url = new URL(req.url);

  if (url.searchParams.get("scope") === "mine_invites") {
    const { data } = await db
      .from("case_access")
      .select("*")
      .eq("invited_email", user.email.toLowerCase())
      .eq("status", "pending_invite");
    return NextResponse.json({ access: data ?? [] });
  }

  const caseId = url.searchParams.get("case_id");
  if (!caseId) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const owner = await assertOwner(db, caseId, user.id);
  if (!owner) {
    const { data: member } = await db
      .from("case_access")
      .select("id")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (!member) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data, error } = await db
    .from("case_access")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ access: data ?? [] });
}

/** POST { case_id, email, role } — owner invites a family member/lawyer/viewer. */
export async function POST(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true }); // demo mode
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = String(body.case_id ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !["family_rep", "lawyer", "viewer"].includes(role)
  )
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  if (!(await assertOwner(db, caseId, user.id)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await db
    .from("case_access")
    .upsert(
      { case_id: caseId, invited_email: email, role, status: "pending_invite", granted_by: user.id },
      { onConflict: "case_id,invited_email" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ access_entry: data });
}

/** PATCH { id, action: accept | revoke } */
export async function PATCH(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");
  if (!id || !["accept", "revoke"].includes(action))
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { data: entry } = await db.from("case_access").select("*").eq("id", id).maybeSingle();
  if (!entry) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (action === "accept") {
    if (
      entry.status === "pending_invite" &&
      entry.invited_email === user.email.toLowerCase()
    ) {
      const { error } = await db
        .from("case_access")
        .update({ status: "active", user_id: user.id, responded_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // revoke — only the case owner
  if (!(await assertOwner(db, entry.case_id, user.id)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { error } = await db
    .from("case_access")
    .update({ status: "revoked", responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
