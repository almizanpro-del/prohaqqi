"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { buildLetter, type ComplaintData, type IssueKey, type RemedyKey } from "@/lib/letters";
import { CBJ_CONTACT, INSURERS } from "@/lib/legal-data";
import { RequireVerified } from "@/components/AuthGate";
import { RequireCaseAccess } from "@/components/CaseGate";
import FeedbackWidget from "@/components/FeedbackWidget";
import CrisisNote from "@/components/CrisisNote";

const EMPTY: ComplaintData = {
  target: "insurer",
  fullName: "",
  nationalId: "",
  phone: "",
  address: "",
  insurerName: "",
  claimNumber: "",
  accidentDate: "",
  accidentLocation: "",
  policeReportNo: "",
  claimAmount: "",
  offeredAmount: "",
  paidAmount: "",
  approvalDate: "",
  issues: [],
  chronology: "",
  remedy: "pay",
  style: "legal",
};

export default function ComplaintsPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<ComplaintData>(EMPTY);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof ComplaintData>(k: K, v: ComplaintData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  function toggleIssue(k: IssueKey) {
    set("issues", data.issues.includes(k) ? data.issues.filter((x) => x !== k) : [...data.issues, k]);
  }

  const letter = useMemo(
    () => (generated ? buildLetter(data, locale as "ar" | "en") : ""),
    [data, generated, locale]
  );

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function downloadTxt() {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haqqi-letter-${data.target}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RequireVerified>
      <RequireCaseAccess>
        <div className="grid gap-8">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-950">{t.complaints.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          {t.complaints.subtitle}
        </p>
      </header>

      <form
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setGenerated(true);
          document.getElementById("letter-preview")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        {/* Target */}
        <fieldset className="card">
          <legend className="mb-3 text-lg font-bold text-stone-900">{t.complaints.stepTarget}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { v: "insurer", label: t.complaints.targetInsurer },
                { v: "cbj", label: t.complaints.targetCbj },
              ] as const
            ).map((o) => (
              <label
                key={o.v}
                className={`cursor-pointer rounded-xl border p-4 text-sm font-semibold transition ${
                  data.target === o.v
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-stone-300 text-stone-600 hover:border-brand-300"
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  className="me-2"
                  checked={data.target === o.v}
                  onChange={() => set("target", o.v)}
                />
                {o.label}
              </label>
            ))}
          </div>
          {data.target === "cbj" && (
            <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs leading-relaxed text-stone-600">
              ℹ️ {t.complaints.cbjHint}
            </p>
          )}
        </fieldset>

        {/* Personal */}
        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-lg font-bold text-stone-900">{t.complaints.stepDetails}</legend>
          <Field id="fn" label={t.complaints.fullName} required value={data.fullName} onChange={(v) => set("fullName", v)} />
          <Field id="nid" label={t.complaints.nationalId} value={data.nationalId} onChange={(v) => set("nationalId", v)} />
          <Field id="ph" label={t.complaints.phone} required value={data.phone} onChange={(v) => set("phone", v)} />
          <Field id="ad" label={t.complaints.address} value={data.address} onChange={(v) => set("address", v)} />
        </fieldset>

        {/* Claim */}
        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-lg font-bold text-stone-900">{t.complaints.stepClaim}</legend>
          <Field
            id="in"
            label={t.complaints.insurerName}
            required={data.target === "insurer"}
            list="insurers"
            value={data.insurerName}
            onChange={(v) => set("insurerName", v)}
          />
          <datalist id="insurers">
            {INSURERS.map((i) => (
              <option key={i.id} value={locale === "ar" ? i.nameAr : i.nameEn} />
            ))}
          </datalist>
          <Field id="cn" label={t.complaints.claimNumber} value={data.claimNumber} onChange={(v) => set("claimNumber", v)} />
          <Field id="cdt" label={t.complaints.accidentDate} type="date" required value={data.accidentDate} onChange={(v) => set("accidentDate", v)} />
          <Field id="cl" label={t.complaints.accidentLocation} value={data.accidentLocation} onChange={(v) => set("accidentLocation", v)} />
          <Field id="prn" label={t.complaints.policeReportNo} value={data.policeReportNo} onChange={(v) => set("policeReportNo", v)} />
          <Field id="ca" label={t.complaints.claimAmount} type="number" min="0" step="0.01" value={data.claimAmount} onChange={(v) => set("claimAmount", v)} />
          <Field id="oa" label={t.complaints.offeredAmount} type="number" min="0" step="0.01" value={data.offeredAmount} onChange={(v) => set("offeredAmount", v)} />
          <Field id="pa" label={t.complaints.paidAmount} type="number" min="0" step="0.01" value={data.paidAmount} onChange={(v) => set("paidAmount", v)} />
          <Field id="apdt" label={t.complaints.approvalDate} type="date" value={data.approvalDate} onChange={(v) => set("approvalDate", v)} />

          <div className="sm:col-span-2">
            <span className="label">{t.complaints.issues}</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(t.complaints.issueOptions) as IssueKey[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => toggleIssue(k)}
                  className={`chip ${data.issues.includes(k) ? "chip-active" : ""}`}
                  aria-pressed={data.issues.includes(k)}
                >
                  {t.complaints.issueOptions[k]}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="chr" className="label">{t.complaints.chronology}</label>
            <textarea
              id="chr"
              rows={5}
              maxLength={4000}
              value={data.chronology}
              placeholder={t.complaints.chronologyPlaceholder}
              onChange={(e) => set("chronology", e.target.value)}
              className="input"
            />
          </div>

          <CrisisNote text={`${data.chronology} ${data.issues.includes("intimidation") ? "تهديد intimidation" : ""}`} />

          <div className="sm:col-span-2">
            <label htmlFor="rem" className="label">{t.complaints.requestedRemedy}</label>
            <select id="rem" value={data.remedy} onChange={(e) => set("remedy", e.target.value as RemedyKey)} className="input">
              {(Object.keys(t.complaints.remedyOptions) as RemedyKey[]).map((k) => (
                <option key={k} value={k}>{t.complaints.remedyOptions[k]}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="sty" className="label">{t.complaints.languageStyle}</label>
            <select id="sty" value={data.style} onChange={(e) => set("style", e.target.value as ComplaintData["style"])} className="input">
              <option value="legal">{t.complaints.styleLegal}</option>
              <option value="plain">{t.complaints.stylePlain}</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={!data.issues.length}>
              ✍️ {t.complaints.generate}
            </button>
          </div>
        </fieldset>
      </form>

      {/* Preview */}
      {generated && (
        <section id="letter-preview" aria-labelledby="lp-title" className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="lp-title" className="text-xl font-extrabold text-stone-900">
              {t.complaints.letterPreview}
              <span className="ms-2 text-xs font-medium text-stone-400">{t.complaints.editHint}</span>
            </h2>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button type="button" onClick={copyLetter} className="btn-secondary !py-2 !text-xs">
                {copied ? t.common.copied : `📋 ${t.common.copy}`}
              </button>
              <button type="button" onClick={downloadTxt} className="btn-secondary !py-2 !text-xs">
                ⬇️ {t.common.downloadTxt}
              </button>
              <button type="button" onClick={() => window.print()} className="btn-primary !py-2 !text-xs">
                🖨️ {t.common.print}
              </button>
            </div>
          </div>
          <textarea
            id="letter-print"
            readOnly
            dir={locale === "ar" ? "rtl" : "ltr"}
            value={letter}
            rows={26}
            className="w-full rounded-2xl border border-brand-200 bg-white p-6 font-serif text-[15px] leading-loose shadow-card focus:outline-none"
          />
          <p className="text-center text-xs text-stone-400 print:hidden">{t.complaints.printHint}</p>
          <div className="flex justify-center print:hidden">
            <FeedbackWidget context="draft" refId={`letter-${new Date().toISOString().slice(0, 10)}`} />
          </div>
        </section>
      )}

      {/* Directory */}
      <section aria-labelledby="dir-title">
        <h2 id="dir-title" className="text-xl font-extrabold text-stone-900">
          {t.complaints.directoryTitle}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">{t.complaints.directoryNote}</p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50 text-xs uppercase tracking-wide text-brand-800">
                <th scope="col" className="px-4 py-3 text-start font-bold">{t.complaints.insurerCol}</th>
                <th scope="col" className="px-4 py-3 text-start font-bold">{t.complaints.contactCol}</th>
                <th scope="col" className="px-4 py-3 text-start font-bold">—</th>
              </tr>
            </thead>
            <tbody>
              {INSURERS.map((i) => (
                <tr key={i.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-800">
                    {locale === "ar" ? i.nameAr : i.nameEn}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {i.email ?? i.phone ?? i.website ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">
                      {t.complaints.unverifiedTag}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-brand-50/70">
                <td className="px-4 py-3 font-extrabold text-brand-800">{locale === "ar" ? CBJ_CONTACT.unitAr : CBJ_CONTACT.unitEn}</td>
                <td className="px-4 py-3 font-semibold text-brand-700">
                  {CBJ_CONTACT.email} · {CBJ_CONTACT.phone}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-800">
                    ✓ {t.complaints.verifiedTag}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
      </RequireCaseAccess>
    </RequireVerified>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
  step,
  list,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  list?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        min={min}
        step={step}
        list={list}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
