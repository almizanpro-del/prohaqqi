import { NextResponse } from "next/server";
import { getUserFromRequest, getServerSupabase, hasServerDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/** POST /api/feedback — thumbs up/down quality signal on AI outputs. */
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!hasServerDb() || !user) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const context = String(body.context ?? "");
  const rating = String(body.rating ?? "");
  if (!["intake", "draft", "rag"].includes(context) || !["up", "down"].includes(rating))
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const db = getServerSupabase()!;
  await db.from("ai_feedback").insert({
    user_id: user.id,
    context,
    ref_id: body.ref_id ? String(body.ref_id).slice(0, 100) : null,
    rating,
    comment: body.comment ? String(body.comment).slice(0, 1000) : null,
  });
  return NextResponse.json({ ok: true });
}
