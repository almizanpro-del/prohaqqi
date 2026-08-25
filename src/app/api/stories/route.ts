import { NextResponse } from "next/server";
import { getServerSupabase, hasSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type StoryRow = {
  id: string;
  accident_date: string | null;
  insurer_name: string | null;
  abuse_types: string[];
  outcome: string;
  description: string;
  is_approved: boolean;
  created_at: string;
};

type MockStore = { stories: StoryRow[] };

// In-memory store used when Supabase is not configured (dev/demo only).
const g = globalThis as unknown as { __haqqiMock?: MockStore };
function mock(): MockStore {
  if (!g.__haqqiMock) {
    g.__haqqiMock = { stories: [] }; // no seeded content — real stories arrive via moderation
  }
  return g.__haqqiMock;
}

export async function GET() {
  if (hasSupabase) {
    const db = getServerSupabase();
    const { data, error } = await db!
      .from("stories")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stories: data });
  }
  return NextResponse.json({ stories: mock().stories });
}

const ISSUE_KEYS = ["delay", "lowball", "denial", "docs_loop", "intimidation", "silence"];
const OUTCOMES = ["pending", "resolved_full", "resolved_partial", "abandoned", "court"];

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const description = String(body.description ?? "").trim();
  const consent = body.consent === true;
  const abuseTypes = Array.isArray(body.abuseTypes)
    ? (body.abuseTypes as unknown[]).map(String).filter((t) => ISSUE_KEYS.includes(t))
    : [];
  const outcome = OUTCOMES.includes(String(body.outcome)) ? String(body.outcome) : "pending";
  const insurerName = String(body.insurerName ?? "").trim().slice(0, 120);
  const accidentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.accidentDate ?? ""))
    ? String(body.accidentDate)
    : null;
  const email =
    typeof body.email === "string" && body.email.includes("@")
      ? body.email.trim().slice(0, 200)
      : null;

  if (description.length < 30 || description.length > 4000 || !consent || abuseTypes.length === 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const row = {
    accident_date: accidentDate,
    insurer_name: insurerName || null,
    abuse_types: abuseTypes,
    outcome,
    description,
    email,
    is_approved: false,
  };

  if (hasSupabase) {
    const db = getServerSupabase();
    const { error } = await db!.from("stories").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    mock().stories.unshift({
      id: `mock-${Date.now()}`,
      accident_date: row.accident_date,
      insurer_name: row.insurer_name,
      abuse_types: row.abuse_types,
      outcome: row.outcome,
      description: row.description,
      is_approved: true, // demo store auto-approves so the UI is explorable
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
