import { NextResponse } from "next/server";
import { requireAdmin, hasServerDb, getServerSupabase } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/overview — pending queues + recent audit trail. */
export async function GET(req: Request) {
  if (!hasServerDb())
    return NextResponse.json({ demo: true, payments: [], stories: [], lawyer_applications: [], deletion_requests: [], audit_logs: [] });

  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = getServerSupabase()!;

  const [payments, stories, apps, deletions, audit] = await Promise.all([
    db.from("payments").select("*").eq("status", "pending").order("created_at").limit(50),
    db.from("stories").select("id,insurer_name,description,outcome,created_at").eq("is_approved", false).order("created_at").limit(50),
    db.from("lawyer_applications").select("*").eq("status", "pending").order("created_at").limit(50),
    db.from("deletion_requests").select("*").eq("status", "received").order("created_at").limit(50),
    db
      .from("audit_logs")
      .select("id,user_id,action,entity,entity_id,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return NextResponse.json({
    demo: false,
    payments: payments.data ?? [],
    stories: stories.data ?? [],
    lawyer_applications: apps.data ?? [],
    deletion_requests: deletions.data ?? [],
    audit_logs: audit.data ?? [],
  });
}
