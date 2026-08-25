import { NextResponse } from "next/server";
import { getServerSupabase, hasSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true }); // honeypot
  }

  const email = String(body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 1000) : null;

  if (hasSupabase) {
    const db = getServerSupabase();
    const { error } = await db!
      .from("deletion_requests")
      .insert({ email, details, status: "received" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Even without a database we acknowledge the request; in production the
  // address is also forwarded to the DPO mailbox by the deployment config.
  return NextResponse.json({ ok: true });
}
