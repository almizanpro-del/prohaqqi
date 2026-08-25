"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="grid gap-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white px-6 py-14 text-center sm:px-12">
        <p className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-bold text-brand-800">
          {t.home.heroKicker}
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-snug text-brand-950 sm:text-4xl">
          {t.home.heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600">
          {t.home.heroSubtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/workflow" className="btn-primary">{t.home.ctaPlan}</Link>
          <Link href="/rights" className="btn-secondary">{t.home.ctaRights}</Link>
          <Link href="/complaints" className="btn-secondary">{t.home.ctaComplaint}</Link>
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-stone-500">
          <li>✓ {t.home.trustBadge1}</li>
          <li>✓ {t.home.trustBadge2}</li>
          <li>✓ {t.home.trustBadge3}</li>
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title">
        <h2 id="how-title" className="text-center text-2xl font-extrabold text-stone-900">
          {t.home.howTitle}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.home.howSteps.map((s) => (
            <div key={s.title} className="card">
              <h3 className="text-lg font-bold text-brand-800">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key numbers */}
      <section aria-labelledby="nums-title" className="card bg-brand-900 text-white">
        <h2 id="nums-title" className="text-2xl font-extrabold">
          {t.home.ceilingsTeaserTitle}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { big: "≈ 20,000", small: t.common.jod },
            { big: "≈ 100", small: `${t.common.jod} / ${t.common.weeks}` },
            { big: "5–10", small: t.common.workingDays },
          ].map((x) => (
            <div key={x.big} className="rounded-2xl bg-brand-800/60 p-5 text-center">
              <p className="text-3xl font-extrabold">{x.big}</p>
              <p className="mt-1 text-sm text-brand-100">{x.small}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-brand-200">{t.home.ceilingsTeaserNote}</p>
        <Link href="/rights" className="btn-secondary mt-6 !bg-white !border-none !text-brand-800">
          {t.common.seeMore}
        </Link>
      </section>

      {/* Pricing teaser */}
      <section aria-labelledby="pricing-teaser" className="card border-brand-200">
        <h2 id="pricing-teaser" className="text-xl font-extrabold text-stone-900">
          💳 {t.home.pricingTeaserTitle}
        </h2>
        <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-stone-600">
          <li>🟢 {t.home.pricingTeaserFree}</li>
          <li>🔵 {t.home.pricingTeaserPaid}</li>
        </ul>
        <Link href="/pricing" className="btn-secondary mt-5">{t.home.pricingCta}</Link>
      </section>

      {/* Corruption alert */}
      <section className="card border-red-200 bg-red-50">
        <h2 className="text-xl font-extrabold text-red-800">🚨 {t.home.corruptionAlertTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-900/90">
          {t.home.corruptionAlertBody}
        </p>
      </section>

      {/* Stories teaser */}
      <section aria-labelledby="stories-teaser" className="card">
        <h2 id="stories-teaser" className="text-xl font-extrabold text-stone-900">
          {t.home.storiesTeaserTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          {t.home.storiesTeaserBody}
        </p>
        <Link href="/stories" className="btn-primary mt-5">{t.nav.stories}</Link>
      </section>
    </div>
  );
}
