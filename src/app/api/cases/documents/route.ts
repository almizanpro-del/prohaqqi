import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Evidence chain-of-custody metadata.
 * The SHA-256 hash is computed in the browser over the raw bytes BEFORE any
 * upload, so authenticity can be proven even though the platform never sees
 * the file until Storage integration lands (Phase 2).
 */

export async function GET(req: Request) {
  if (!hasServerDb()) return NextResponse.json({ documents: [] });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const caseId = new URL(req.url).searchParams.get("case_id");
  if (!caseId) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { data, error } = await db
    .from("documents")
    .select("id,case_id,original_name,size_bytes,mime_type,sha256,uploaded_at,type")
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(req: Request) {
  if (!hasServerDb())
    return NextResponse.json({ ok: true, note: "metadata stored locally in demo mode" });
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = String(body.case_id ?? "");
  const name = String(body.original_name ?? "").slice(0, 255);
  const sha = String(body.sha256 ?? "").toLowerCase();
  if (!caseId || !name || !/^[0-9a-f]{64}$/.test(sha))
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  const { data, error } = await db
    .from("documents")
    .insert({
      case_id: caseId,
      type: "evidence",
      original_name: name,
      size_bytes: Number(body.size_bytes ?? 0),
      mime_type: String(body.mime_type ?? "application/octet-stream").slice(0, 120),
      sha256: sha,
      file_url: "", // populated when bytes are moved into Storage (Phase 2)
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}
