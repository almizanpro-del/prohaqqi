import { NextResponse } from "next/server";
import { requireAdmin, hasServerDb, getServerSupabase } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const ALLOWED: Record<
  string,
  Record<string, (db: NonNullable<ReturnType<typeof getServerSupabase>>, id: string) => Promise<unknown>>
> = {
  payment: {
    confirm: async (db, id) =>
      db.from("payments").update({ status: "confirmed", reviewed_at: new Date().toISOString() }).eq("id", id),
    reject: async (db, id) =>
      db.from("payments").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id),
  },
  story: {
    approve: async (db, id) => db.from("stories").update({ is_approved: true }).eq("id", id),
    delete: async (db, id) => db.from("stories").delete().eq("id", id),
  },
  lawyer_application: {
    approve: async (db, id) => {
      const { data: app } = await db.from("lawyer_applications").select("*").eq("id", id).single();
      if (!app) throw new Error("not_found");
      // Create/link the verified lawyer profile with the applicant's account.
      const { data: existing } = await db.from("lawyers").select("id").eq("user_id", app.user_id).maybeSingle();
      if (!existing) {
        await db.from("lawyers").insert({
          name: app.full_name,
          user_id: app.user_id,
          languages: ["ar"],
          fee_model: "contingency",
          is_verified: true,
        });
      }
      return db
        .from("lawyer_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", id);
    },
    reject: async (db, id) =>
      await db
        .from("lawyer_applications")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", id),
  },
  deletion_request: {
    complete: async (db, id) =>
      await db
        .from("deletion_requests")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id),
  },
};

/** POST /api/admin/action — { entity, id, action } */
export async function POST(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ ok: true, demo: true });
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const entity = String(body.entity ?? "");
  const action = String(body.action ?? "");
  const id = String(body.id ?? "");
  const table = ALLOWED[entity];
  if (!table || !table[action] || !id)
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const result = await table[action](db, id);
  if (result && typeof result === "object" && "error" in result) {
    const err = (result as { error: { message?: string } | null }).error;
    if (err) return NextResponse.json({ error: err.message ?? "failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
