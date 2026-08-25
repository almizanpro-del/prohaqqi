"use client";

import { useI18n } from "@/lib/i18n";

const CRISIS_KEYWORDS = [
  "وفاة","توفي","توفيت","فقدنا","استشهد","قتل","قتيل","جثمان","تهديد","انتحار","دموي","عجز كامل",
  "death","died","passed away","killed","threat","suicide",
];

/** Detects distress signals and surfaces a supportive, safety-first note. */
export default function CrisisNote({ text }: { text: string }) {
  const { t } = useI18n();
  const lower = (text ?? "").toLowerCase();
  const hit = CRISIS_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
  if (!hit) return null;

  return (
    <div role="note" className="card border-purple-200 bg-purple-50">
      <h3 className="font-extrabold text-purple-900">💜 {t.platform.crisisTitle}</h3>
      <p className="mt-2 text-sm leading-relaxed text-purple-900/90">{t.platform.crisisBody}</p>
    </div>
  );
}
