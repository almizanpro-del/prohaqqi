"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, useCaseAccess } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

type PaymentRow = {
  id: string;
  amount_jod: number | string;
  cliq_reference: string;
  status: string;
  created_at: string;
};

const CLIQ_ALIAS = process.env.NEXT_PUBLIC_CLIQ_ALIAS ?? "";
const CLIQ_IBAN = process.env.NEXT_PUBLIC_CLIQ_IBAN ?? "";

export default function PayPage() {
  const { t, locale } = useI18n();
  const { user, mode } = useAuth();
  const { paid, demoConfirmPayment } = useCaseAccess();
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    if (mode !== "supabase" || !user) return;
    (async () => {
      try {
        const sb = getBrowserSupabase()!;
        const { data } = await sb.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch("/api/payments", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        setHistory(Array.isArray(json.payments) ? json.payments : []);
      } catch {
        setHistory([]);
      }
    })();
  }, [mode, user, submitted]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const sb = getBrowserSupabase()!;
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reference: String(fd.get("reference") ?? "").trim(),
          senderName: String(fd.get("senderName") ?? "").trim(),
          caseLabel: String(fd.get("caseLabel") ?? "").trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold text-brand-950">{t.pay.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.pay.intro}</p>

      {paid && (
        <div className="card mt-6 border-green-300 bg-green-50 text-center">
          <p className="font-extrabold text-green-800">✓ {t.pay.stConfirmed}</p>
          <Link href="/workflow" className="btn-primary mt-4">{t.pay.backToPlan}</Link>
        </div>
      )}

      {!paid && (
        <>
          <section className="card mt-6 grid gap-4">
            <p className="font-bold text-stone-800">{t.pay.step1}</p>
            <p className="font-bold text-stone-800">{t.pay.step2}</p>

            <div className="grid gap-3 rounded-xl bg-sand-100 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="label !mb-0.5">{t.pay.aliasLabel}</span>
                <code dir="ltr" className="block rounded-lg bg-white px-3 py-2 font-mono font-bold text-brand-800">
                  {CLIQ_ALIAS || "—"}
                </code>
              </div>
              {CLIQ_IBAN && (
                <div>
                  <span className="label !mb-0.5">{t.pay.ibanLabel}</span>
                  <code dir="ltr" className="block break-all rounded-lg bg-white px-3 py-2 font-mono">
                    {CLIQ_IBAN}
                  </code>
                </div>
              )}
            </div>

            {!CLIQ_ALIAS && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                ⚠️ {t.pay.configMissing}
              </p>
            )}

            <p className="text-sm text-stone-500">{t.pay.step3}</p>
          </section>

          {mode === "demo" ? (
            <section className="card mt-6 border-amber-200 bg-amber-50/60">
              <h2 className="font-bold text-stone-900">🧪 {t.pay.demoBoxTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.pay.demoBoxBody}</p>
              <button type="button" onClick={demoConfirmPayment} className="btn-primary mt-4">
                {t.pay.demoBtn}
              </button>
            </section>
          ) : (
            <form onSubmit={submit} className="card mt-6 grid gap-4">
              <h2 className="font-bold text-stone-900">{t.pay.formTitle}</h2>
              <label className="block">
                <span className="label">{t.pay.reference} <span className="text-red-600">*</span></span>
                <input name="reference" required dir="ltr" maxLength={60} placeholder={t.pay.referencePlaceholder} className="input" />
              </label>
              <label className="block">
                <span className="label">{t.pay.senderName} <span className="text-red-600">*</span></span>
                <input name="senderName" required maxLength={120} className="input" />
              </label>
              <label className="block">
                <span className="label">{t.pay.caseLabel}</span>
                <input name="caseLabel" maxLength={160} dir={locale === "ar" ? "rtl" : "ltr"} className="input" />
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
              )}
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? t.common.submitting : t.pay.btnSubmit}
              </button>
            </form>
          )}

          {(submitted || (history && history.length > 0)) && mode === "supabase" && (
            <section className="card mt-6">
              {submitted && (
                <p className="mb-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
                  ✓ {t.pay.pendingMsg}
                </p>
              )}
              {history && history.length > 0 && (
                <>
                  <h3 className="mb-2 text-sm font-bold text-stone-700">{t.pay.statusHistory}</h3>
                  <ul className="grid gap-2">
                    {history.map((p) => (
                      <li key={p.id} className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-2 text-sm">
                        <span dir="ltr" className="font-mono text-xs text-stone-500">{p.cliq_reference}</span>
                        <span className="font-bold text-stone-700">{Number(p.amount_jod)} {t.common.jod}</span>
                        <span
                          className={
                            p.status === "confirmed"
                              ? "font-bold text-green-700"
                              : p.status === "rejected"
                                ? "font-bold text-red-700"
                                : "font-bold text-amber-600"
                          }
                        >
                          {p.status === "confirmed"
                            ? t.pay.stConfirmed
                            : p.status === "rejected"
                              ? t.pay.stRejected
                              : t.pay.stPending}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
