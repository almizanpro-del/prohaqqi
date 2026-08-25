"use client";

import { useI18n } from "@/lib/i18n";

export default function Disclaimer() {
  const { t } = useI18n();
  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium leading-relaxed text-amber-900 print:hidden"
    >
      ⚠️ {t.common.notLegalAdvice}
    </div>
  );
}
