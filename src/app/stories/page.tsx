"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { RequireVerified } from "@/components/AuthGate";

type Story = {
  id: string;
  accident_date: string | null;
  insurer_name: string | null;
  abuse_types: string[];
  outcome: string;
  description: string;
};

const ISSUE_KEYS = ["delay", "lowball", "denial", "docs_loop", "intimidation", "silence"] as const;

export default function StoriesPage() {
  const { t, locale } = useI18n();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/stories", { cache: "no-store" });
      const json = await res.json();
      setStories(json.stories ?? []);
    } catch {
      setStories([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: fd.get("website"), // honeypot
          accidentDate: fd.get("accidentDate"),
          insurerName: fd.get("insurerName"),
          abuseTypes: fd.getAll("abuseType"),
          outcome: fd.get("outcome"),
          description: fd.get("description"),
          email: fd.get("email"),
          consent: fd.get("consent") === "on",
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      f.reset();
      load();
    } catch {
      setError(t.common.errorGeneric);
    } finally {
      setSending(false);
    }
  }

  const filtered = (stories ?? []).filter(
    (s) => filter === "all" || s.abuse_types.includes(filter)
  );

  return (
    <RequireVerified>
      <div className="grid gap-10">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-950">{t.stories.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{t.stories.subtitle}</p>
      </header>

      {/* Filters */}
      <div role="group" aria-label={t.stories.formTypes} className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
        >
          {t.stories.filterAll}
        </button>
        {ISSUE_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`chip ${filter === k ? "chip-active" : ""}`}
          >
            {t.complaints.issueOptions[k]}
          </button>
        ))}
      </div>

      {/* List */}
      <section aria-live="polite">
        {stories === null ? (
          <p className="text-sm text-stone-400">…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-stone-500">{t.stories.empty}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filtered.map((s) => (
              <li key={s.id} className="card !p-5">
                <div className="flex flex-wrap gap-1.5">
                  {s.abuse_types.map((k) => (
                    <span key={k} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      {t.complaints.issueOptions[k as keyof typeof t.complaints.issueOptions] ?? k}
                    </span>
                  ))}
                </div>
                <p dir="auto" className="mt-3 text-sm leading-relaxed text-stone-700">
                  {s.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-3 text-xs text-stone-400">
                  <span>{t.stories.formOutcome}: {t.stories.outcomeOptions[s.outcome as keyof typeof t.stories.outcomeOptions] ?? s.outcome}</span>
                  {s.accident_date && <span>📆 {s.accident_date}</span>}
                  {s.insurer_name && <span>🏢 {s.insurer_name}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Submit */}
      <section id="share" aria-labelledby="share-title" className="card">
        <h2 id="share-title" className="text-xl font-extrabold text-stone-900">
          {t.stories.shareTitle}
        </h2>
        <p className="mt-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-900">
          🔒 {t.stories.shareIntro}
        </p>

        {sent ? (
          <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">
            ✅ {t.stories.submitSuccess}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate={false}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <label className="block">
              <span className="label">{t.stories.formAccidentDate}</span>
              <input name="accidentDate" type="date" max={new Date().toISOString().slice(0, 10)} className="input" />
            </label>

            <label className="block">
              <span className="label">{t.stories.formInsurer}</span>
              <input name="insurerName" maxLength={120} className="input" />
            </label>

            <fieldset className="sm:col-span-2">
              <legend className="label">{t.stories.formTypes}</legend>
              <div className="flex flex-wrap gap-2">
                {ISSUE_KEYS.map((k) => (
                  <label key={k} className="chip cursor-pointer has-[:checked]:chip-active">
                    <input type="checkbox" name="abuseType" value={k} className="me-1.5" />
                    {t.complaints.issueOptions[k]}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="label">{t.stories.formOutcome}</span>
              <select name="outcome" className="input" defaultValue="pending">
                {(Object.keys(t.stories.outcomeOptions) as Array<keyof typeof t.stories.outcomeOptions>).map((k) => (
                  <option key={k} value={k}>{t.stories.outcomeOptions[k]}</option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="label">
                {t.stories.formDescription} <span className="text-red-600">*</span>
              </span>
              <textarea
                name="description"
                rows={6}
                required
                minLength={30}
                maxLength={4000}
                dir="auto"
                placeholder={t.stories.descriptionPlaceholder}
                className="input"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="label">{t.stories.formEmailOptional}</span>
              <input name="email" type="email" className="input" />
            </label>

            <label className="flex items-start gap-2 sm:col-span-2">
              <input name="consent" type="checkbox" required className="mt-1" />
              <span className="text-xs leading-relaxed text-stone-600">{t.stories.consentLabel}</span>
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>
            )}

            <div className="sm:col-span-2">
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? t.common.submitting : `✉️ ${t.common.submit}`}
              </button>
              <p className="mt-3 text-xs text-stone-400">{t.stories.moderationNote}</p>
            </div>
          </form>
        )}
      </section>
    </div>
    </RequireVerified>
  );
}
