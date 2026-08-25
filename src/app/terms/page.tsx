"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold text-brand-950">{t.terms.title}</h1>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-900">
        {t.terms.notice}
      </p>
      <ul className="mt-6 grid list-disc gap-2 ps-5 text-sm leading-relaxed text-stone-600">
        {t.terms.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-8 flex gap-3">
        <Link href="/pricing" className="btn-secondary !py-2 !text-xs">{t.nav.pricing}</Link>
        <Link href="/privacy" className="btn-secondary !py-2 !text-xs">{t.nav.privacy}</Link>
      </div>
    </div>
  );
}
