import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAnon: SupabaseClient | null = null;

function anon(): SupabaseClient | null {
  if (!cachedAnon) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    cachedAnon = createClient(url, key, { auth: { persistSession: false } });
  }
  return cachedAnon;
}

export function hasServerDb(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Resolve the authenticated user from the Authorization bearer token. */
export async function getUserFromRequest(
  req: Request
): Promise<{ id: string; email: string } | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const sb = anon();
  if (!token || !sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

/** Verify the caller is a platform admin (admins table). */
export async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || !hasServerDb()) return null;
  const db = getServerSupabase()!;
  const { data } = await db.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export { getServerSupabase };
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
