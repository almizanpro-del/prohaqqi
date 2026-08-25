"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function FeedbackWidget({ context, refId }: { context: "draft" | "intake" | "rag"; refId?: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [sent, setSent] = useState<string | null>(null);

  async function send(rating: "up" | "down") {
    setSent(rating);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, rating, ref_id: refId }),
      });
    } catch {
      /* quality signal is best-effort */
    }
  }

  if (!user?.verified) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-stone-500 print:hidden">
      <span>{t.platform.feedbackPrompt}</span>
      {sent ? (
        <span className="font-bold text-green-700">✓ {t.platform.feedbackThanks}</span>
      ) : (
        <span className="flex gap-1.5">
          <button
            type="button"
            onClick={() => send("up")}
            aria-label="👍"
            className="rounded-lg border border-stone-300 px-2 py-1 hover:bg-green-50"
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => send("down")}
            aria-label="👎"
            className="rounded-lg border border-stone-300 px-2 py-1 hover:bg-red-50"
          >
            👎
          </button>
        </span>
      )}
    </div>
  );
}
