"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t } = useI18n();
  return (
    <div className="grid gap-10">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-950">{t.pricing.title}</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
          {t.pricing.subtitle}
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="card">
          <h2 className="text-lg font-bold text-stone-900">{t.pricing.freeTitle}</h2>
          <ul className="mt-4 grid list-disc gap-2 ps-5 text-sm leading-relaxed text-stone-600">
            {t.pricing.freeItems.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-brand-50 px-3 py-2 text-center text-sm font-extrabold text-brand-700">
            0 {t.common.jod}
          </p>
        </div>

        {/* Paid */}
        <div className="card border-brand-300 ring-1 ring-brand-200">
          <h2 className="text-lg font-bold text-stone-900">{t.pricing.paidTitle}</h2>
          <p className="mt-1 text-xs font-semibold text-stone-400">{t.pricing.paidPer}</p>
          <ul className="mt-4 grid list-disc gap-2 ps-5 text-sm leading-relaxed text-stone-600">
            {t.pricing.paidItems.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-brand-600 px-3 py-2 text-center text-sm font-extrabold text-white">
            {t.pricing.paidPrice} — CliQ
          </p>
        </div>
      </section>

      <section aria-labelledby="how-title" className="card bg-brand-900 text-white">
        <h2 id="how-title" className="text-xl font-extrabold">{t.pricing.howTitle}</h2>
        <ol className="mt-4 grid gap-2 ps-5 text-sm leading-relaxed text-brand-100" style={{ listStyleType: "decimal" }}>
          {t.pricing.howSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-5 font-bold text-white">{t.pricing.cliqOnly}</p>
      </section>

      <div className="flex justify-center gap-3">
        <Link href="/auth/register" className="btn-primary">{t.pricing.ctaStart}</Link>
      </div>
    </div>
  );
}
