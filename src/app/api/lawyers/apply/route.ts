import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/lawyers/apply — lawyer verification onboarding.
 * The applicant uploads bar license + ID; the browser hashes both files and
 * only the metadata/hashes are submitted. Admin reviews and approves.
 */
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const fullName = String(body.full_name ?? "").trim().slice(0, 160);
  const barNumber = String(body.bar_number ?? "").trim().slice(0, 60);
  const barAssociation = String(body.bar_association ?? "").trim().slice(0, 160);
  const licenseSha = String(body.license_sha256 ?? "").toLowerCase();
  if (
    fullName.length < 3 ||
    barNumber.length < 2 ||
    !/^[0-9a-f]{64}$/.test(licenseSha)
  )
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  if (!hasServerDb()) {
    // demo mode — remember application locally so the UI can show status
    try {
      const key = "haqqi_demo_lawyer_apps_v1";
      const apps = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      localStorage.setItem(
        key,
        JSON.stringify([
          ...apps,
          {
            id: crypto.randomUUID(),
            full_name: fullName,
            bar_number: barNumber,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ])
      );
    } catch {}
    return NextResponse.json({ ok: true, demo: true });
  }

  const db = getServerSupabase()!;
  const { data, error } = await db
    .from("lawyer_applications")
    .insert({
      user_id: user.id,
      full_name: fullName,
      bar_number: barNumber,
      bar_association: barAssociation || "نقابة المحامين النظاميين الأردنيين",
      license_sha256: licenseSha,
      license_original_name: String(body.license_original_name ?? "").slice(0, 255) || null,
      id_document_sha256: /^[0-9a-f]{64}$/.test(String(body.id_sha256 ?? ""))
        ? String(body.id_sha256).toLowerCase()
        : null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}

/** GET — my applications' status. */
export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ applications: [] });
  if (!hasServerDb()) {
    let apps: Array<Record<string, unknown>> = [];
    try {
      apps = JSON.parse(localStorage.getItem("haqqi_demo_lawyer_apps_v1") ?? "[]");
    } catch {}
    return NextResponse.json({ applications: apps });
  }
  const db = getServerSupabase()!;
  const { data } = await db
    .from("lawyer_applications")
    .select("id,full_name,status,created_at,reviewer_note")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ applications: data ?? [] });
}
