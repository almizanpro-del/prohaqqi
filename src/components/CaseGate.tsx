"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useCaseAccess } from "@/lib/auth";

/** Blocks paid case tools until the case fee (CliQ, JOD 30) is confirmed. */
export function RequireCaseAccess({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { paid, loading } = useCaseAccess();

  if (loading) {
    return <p className="py-24 text-center text-sm text-stone-400">…</p>;
  }
  if (!paid) {
    return (
      <div className="mx-auto max-w-lg card text-center my-16">
        <h1 className="text-xl font-extrabold text-stone-900">{t.gates.caseLockedTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.gates.caseLockedBody}</p>
        <Link href="/pay" className="btn-primary mt-6">{t.gates.caseLockedCta}</Link>
      </div>
    );
  }
  return <>{children}</>;
}
