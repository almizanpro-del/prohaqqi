import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CASE_PRICE_JOD = 30;

function anonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Resolve the authenticated user from the Authorization bearer token. */
async function getUserFromRequest(
  req: Request
): Promise<{ id: string; email: string } | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const sb = anonClient();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ payments: [] });
  const { data, error } = await db
    .from("payments")
    .select("id,amount_jod,status,cliq_reference,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const reference = String(body.reference ?? "").trim();
  const senderName = String(body.senderName ?? "").trim();
  const caseLabel = String(body.caseLabel ?? "").trim().slice(0, 160);
  if (reference.length < 4 || reference.length > 60 || senderName.length < 3) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const db = getServerSupabase();
  if (!db) return NextResponse.json({ ok: true }); // demo mode: nothing to store

  const { error } = await db.from("payments").insert({
    user_id: user.id,
    amount_jod: CASE_PRICE_JOD,
    cliq_reference: reference.slice(0, 60),
    sender_name: senderName.slice(0, 120),
    case_label: caseLabel || null,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
