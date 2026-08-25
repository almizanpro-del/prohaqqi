"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LEGAL_META } from "@/lib/legal-data";
import { RequireVerified } from "@/components/AuthGate";

type TabKey = "entitlements" | "ceilings" | "deadlines" | "payments" | "documents";

export default function RightsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("entitlements");
  const tabs: TabKey[] = ["entitlements", "ceilings", "deadlines", "payments", "documents"];

  return (
    <RequireVerified>
      <article className="grid gap-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-950">{t.rights.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{t.rights.subtitle}</p>
        <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-xl bg-stone-100 px-4 py-2 text-xs text-stone-500">
          <span>{t.common.version} {LEGAL_META.version}</span>
          <span>·</span>
          <span>{t.common.effectiveFrom}: 2025-01-01</span>
          <span>·</span>
          <span className="font-bold text-amber-700">
            {LEGAL_META.lastReviewedByLawyer
              ? `${t.common.reviewedBy}: ${LEGAL_META.lastReviewedByLawyer}`
              : `⚖️ ${t.common.awaitingReview}`}
          </span>
        </p>
      </header>

      {/* Tabs */}
      <div role="tablist" aria-label={t.rights.title} className="flex flex-wrap gap-2">
        {tabs.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={tab === k ? "chip chip-active" : "chip"}
          >
            {t.rights.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "entitlements" && (
        <section className="grid gap-5">
          <p className="max-w-3xl text-sm leading-relaxed text-stone-700">
            {t.rights.entitlementsIntro}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.rights.heads.map((h) => (
              <div key={h.name} className="card !p-5">
                <h3 className="font-bold text-brand-800">{h.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{h.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "ceilings" && (
        <section>
          <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
            <table className="w-full min-w-[520px] text-sm">
              <caption className="bg-sand-100 px-4 py-2 text-start text-xs font-semibold text-stone-500">
                {t.rights.ceilingsTableCaption}
              </caption>
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50 text-start text-xs uppercase tracking-wide text-brand-800">
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.ceilingsCols.head}</th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.ceilingsCols.amount}</th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.ceilingsCols.notes}</th>
                </tr>
              </thead>
              <tbody>
                {t.rights.ceilingsRows.map((r) => (
                  <tr key={r.head} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-800">{r.head}</td>
                    <td className="px-4 py-3 font-extrabold text-brand-700">{r.amount}</td>
                    <td className="px-4 py-3 text-stone-500">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "deadlines" && (
        <section className="grid gap-5">
          <p className="max-w-2xl text-sm leading-relaxed text-stone-700">{t.rights.deadlinesIntro}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {t.rights.deadlineCards.map((c) => (
              <div
                key={c.title}
                className={`card !p-5 ${c.tone === "critical" ? "!border-red-200 bg-red-50/60" : ""}`}
              >
                <h3 className={`font-bold ${c.tone === "critical" ? "text-red-800" : "text-brand-800"}`}>
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{c.body}</p>
              </div>
            ))}
          </div>
          <Link href="/workflow" className="btn-primary w-fit">{t.home.ctaPlan}</Link>
        </section>
      )}

      {tab === "payments" && (
        <section className="grid gap-6">
          <p className="max-w-2xl text-sm leading-relaxed text-stone-700">{t.rights.paymentsIntro}</p>
          <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
            <table className="w-full min-w-[480px] text-sm">
              <caption className="bg-sand-100 px-4 py-2 text-start text-xs font-semibold text-stone-500">
                {t.rights.paymentsTableCaption}
              </caption>
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50 text-xs uppercase tracking-wide text-brand-800">
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.paymentsCols.band}</th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.paymentsCols.deadline}</th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">{t.rights.paymentsCols.note}</th>
                </tr>
              </thead>
              <tbody>
                {t.rights.paymentsRows.map((r) => (
                  <tr key={r.band} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-800">{r.band}</td>
                    <td className="px-4 py-3 font-extrabold text-brand-700">{r.deadline}</td>
                    <td className="px-4 py-3 text-stone-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold leading-relaxed text-amber-900">
              {t.rights.paymentsEscalation}
            </p>
            <Link href="/complaints" className="btn-primary mt-4">{t.rights.paymentsCta}</Link>
          </div>
        </section>
      )}

      {tab === "documents" && (
        <section className="grid gap-5">
          <p className="max-w-2xl text-sm leading-relaxed text-stone-700">{t.rights.documentsIntro}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.rights.docsGroups.map((g) => (
              <div key={g.title} className="card !p-5">
                <h3 className="font-bold text-brand-800">{g.title}</h3>
                <ul className="mt-3 grid list-disc gap-1.5 ps-5 text-sm text-stone-600">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
    </RequireVerified>
  );
}
