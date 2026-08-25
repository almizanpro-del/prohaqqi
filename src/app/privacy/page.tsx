"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/deletion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: fd.get("website"),
          email: fd.get("email"),
          details: fd.get("details"),
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      f.reset();
    } catch {
      setError(t.common.errorGeneric);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-950">{t.privacy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{t.privacy.subtitle}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {t.privacy.sections.map((s) => (
          <div key={s.title} className="card !p-5">
            <h2 className="font-bold text-brand-800">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.body}</p>
          </div>
        ))}
        <div className="card !p-5">
          <h2 className="font-bold text-brand-800">🍪 {t.privacy.cookiesTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{t.privacy.cookiesBody}</p>
        </div>
      </section>

      {/* Deletion request */}
      <section aria-labelledby="del-title" className="card">
        <h2 id="del-title" className="text-xl font-extrabold text-stone-900">
          🗑️ {t.privacy.deletionTitle}
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">{t.privacy.deletionBody}</p>

        {sent ? (
          <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm font-bold text-brand-800">
            ✅ {t.privacy.deletionSuccess}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label className="block sm:col-span-2">
              <span className="label">
                {t.privacy.deletionEmail} <span className="text-red-600">*</span>
              </span>
              <input name="email" type="email" required className="input" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">{t.privacy.deletionNote}</span>
              <textarea name="details" rows={3} maxLength={1000} dir="auto" className="input" />
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? t.common.submitting : t.common.submit}
              </button>
            </div>
          </form>
        )}
      </section>

      <p className="text-sm leading-relaxed text-stone-600">{t.privacy.contactLine}</p>
    </div>
  );
}
