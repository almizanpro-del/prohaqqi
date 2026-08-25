"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  generatePlan,
  statusOf,
  buildIcs,
  type InjuryLevel,
  type PlanInput,
  type TaskId,
} from "@/lib/workflow";
import { RequireVerified } from "@/components/AuthGate";
import { RequireCaseAccess } from "@/components/CaseGate";

type Done = Record<string, boolean>;

const STORAGE_KEY = "haqqi_plan_v1";

function loadDone(key: string): Done {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY + ":" + key) ?? "{}") as Done;
  } catch {
    return {};
  }
}

export default function WorkflowPage() {
  const { t, locale } = useI18n();

  const [accidentDate, setAccidentDate] = useState("");
  const [injuries, setInjuries] = useState<InjuryLevel>("none");
  const [otherInsured, setOtherInsured] = useState<"yes" | "no" | "unknown">("unknown");
  const [policeReport, setPoliceReport] = useState<"yes" | "no" | "unknown">("unknown");
  const [submitted, setSubmitted] = useState<PlanInput | null>(null);
  const [done, setDone] = useState<Done>({});

  useEffect(() => {
    if (!submitted) return;
    setDone(loadDone(submitted.accidentDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted?.accidentDate]);

  const plan = useMemo(() => (submitted ? generatePlan(submitted) : []), [submitted]);

  function toggleDone(id: string) {
    if (!submitted) return;
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      localStorage.setItem(
        STORAGE_KEY + ":" + submitted.accidentDate,
        JSON.stringify(next)
      );
    } catch {
      /* storage unavailable */
    }
  }

  function downloadIcs() {
    if (!plan.length) return;
    const titles = Object.fromEntries(
      Object.entries(t.workflow.tasks).map(([k, v]) => [k as TaskId, v.title])
    ) as Record<TaskId, string>;
    const blob = new Blob([buildIcs(plan, titles)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "haqqi-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  const grouped = useMemo(() => {
    const g: Record<string, typeof plan> = { overdue: [], today: [], upcoming: [] };
    plan.forEach((p) => {
      if (done[p.id]) return;
      g[statusOf(p.dueDate)].push(p);
    });
    return g;
  }, [plan, done]);

  const doneItems = plan.filter((p) => done[p.id]);
  const progress = plan.length ? Math.round((doneItems.length / plan.length) * 100) : 0;

  return (
    <RequireVerified>
      <RequireCaseAccess>
        <div className="grid gap-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-950">{t.workflow.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{t.workflow.subtitle}</p>
      </header>

      {(injuries === "severe" || injuries === "death") && (
        <div role="alert" className="card border-red-300 bg-red-50">
          <h2 className="font-extrabold text-red-800">🚨 {t.workflow.emergencyTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-red-900">{t.workflow.emergencyBody}</p>
        </div>
      )}

      {/* Intake form */}
      <section aria-labelledby="wf-form" className="card">
        <h2 id="wf-form" className="mb-5 text-lg font-bold text-stone-900">{t.workflow.formTitle}</h2>
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const input: PlanInput = {
              accidentDate,
              injuries,
              otherPartyInsured:
                otherInsured === "yes" ? true : otherInsured === "no" ? false : null,
              policeReportDone: policeReport === "yes" ? true : policeReport === "no" ? false : null,
            };
            setSubmitted(input);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div>
            <label htmlFor="ad" className="label">{t.workflow.accidentDate}</label>
            <input
              id="ad"
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={accidentDate}
              onChange={(e) => setAccidentDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="inj" className="label">{t.workflow.injuries}</label>
            <select id="inj" value={injuries} onChange={(e) => setInjuries(e.target.value as InjuryLevel)} className="input">
              {(["none", "minor", "severe", "death"] as InjuryLevel[]).map((v) => (
                <option key={v} value={v}>{t.workflow.injuryOptions[v]}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="label">{t.workflow.otherInsured}</legend>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              {(["yes", "no", "unknown"] as const).map((v) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                  <input
                    type="radio"
                    name="otherInsured"
                    value={v}
                    checked={otherInsured === v}
                    onChange={() => setOtherInsured(v)}
                  />
                  {v === "yes" ? t.common.yes : v === "no" ? t.common.no : t.common.notSure}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">{t.workflow.policeReport}</legend>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              {(["yes", "no", "unknown"] as const).map((v) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                  <input
                    type="radio"
                    name="policeReport"
                    value={v}
                    checked={policeReport === v}
                    onChange={() => setPoliceReport(v)}
                  />
                  {v === "yes" ? t.common.yes : v === "no" ? t.common.no : t.common.notSure}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">{t.workflow.generate}</button>
          </div>
        </form>
      </section>

      {/* Plan */}
      {submitted && (
        <section aria-labelledby="plan-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="plan-title" className="text-xl font-extrabold text-stone-900">
              {t.workflow.planTitle}
              {submitted.accidentDate && (
                <span className="ms-2 text-sm font-medium text-stone-500">
                  ({t.workflow.planFor} {submitted.accidentDate})
                </span>
              )}
            </h2>
            <button type="button" onClick={downloadIcs} className="btn-secondary !py-2">
              📅 {t.workflow.icsButton}
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-stone-500">
              {progress}% — {doneItems.length} {t.workflow.progressOf} {plan.length} ·{" "}
              {t.workflow.saveNote}
            </p>
          </div>

          {(["overdue", "today", "upcoming"] as const).map((bucket) =>
            grouped[bucket].length === 0 ? null : (
              <div key={bucket} className="mt-6">
                <h3
                  className={`mb-3 text-sm font-extrabold uppercase tracking-wide ${
                    bucket === "overdue"
                      ? "text-red-700"
                      : bucket === "today"
                        ? "text-amber-600"
                        : "text-stone-500"
                  }`}
                >
                  {bucket === "overdue"
                    ? `⚠️ ${t.workflow.statusOverdue}`
                    : bucket === "today"
                      ? t.workflow.statusToday
                      : t.workflow.statusUpcoming}
                </h3>
                <ul className="grid gap-3">
                  {grouped[bucket].map((item) => (
                    <li
                      key={item.id}
                      className={`card flex items-start justify-between gap-4 !p-4 ${
                        item.critical && bucket !== "upcoming" ? "!border-red-200" : ""
                      }`}
                    >
                      <div>
                        <p className="font-bold text-stone-900">{t.workflow.tasks[item.id].title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-600">
                          {t.workflow.tasks[item.id].detail}
                        </p>
                        <p className="mt-1.5 text-xs font-bold text-brand-700">
                          📆 {formatDate(item.dueDate, locale)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDone(item.id)}
                        className="btn-secondary shrink-0 !px-3 !py-1.5 !text-xs"
                        aria-label={t.workflow.markDone}
                      >
                        ✓
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {doneItems.length > 0 && (
            <details className="mt-6 card !py-4">
              <summary className="cursor-pointer text-sm font-bold text-stone-600">
                ✓ {t.workflow.statusDone} ({doneItems.length})
              </summary>
              <ul className="mt-3 grid list-disc gap-1.5 ps-5 text-sm text-stone-500">
                {doneItems.map((it) => (
                  <li key={it.id}>{t.workflow.tasks[it.id].title}</li>
                ))}
              </ul>
            </details>
          )}

          <p className="mt-4 text-xs leading-relaxed text-stone-400">{t.workflow.reminderNote}</p>

          {grouped.overdue.some((x) => x.id === "payment_deadline" || x.id === "escalation_cbj") && (
            <Link href="/complaints" className="btn-primary mt-6">{t.rights.paymentsCta}</Link>
          )}
        </section>
      )}
        </div>
      </RequireCaseAccess>
    </RequireVerified>
  );
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(iso + "T00:00:00Z"));
  } catch {
    return iso;
  }
}
