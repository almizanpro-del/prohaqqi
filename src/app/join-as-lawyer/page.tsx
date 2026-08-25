"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { sha256Hex } from "@/lib/case-store";
import { RequireVerified } from "@/components/AuthGate";

export default function JoinAsLawyerPage() {
  return (
    <RequireVerified>
      <Inner />
    </RequireVerified>
  );
}

function Inner() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState<Array<{ id: string; status: string; full_name?: string; created_at?: string }>>([]);

  async function loadApps() {
    try {
      const res = await fetch("/api/lawyers/apply");
      const json = await res.json();
      setApps(json.applications ?? []);
    } catch {
      setApps([]);
    }
  }
  useEffect(() => {
    loadApps();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const licenseFile = (fd.get("license") as File | null) ?? null;
    const idFile = (fd.get("id_doc") as File | null) ?? null;
    if (!licenseFile || licenseFile.size === 0) return;

    setBusy(true);
    setError(null);
    try {
      setHashing(true);
      const licenseSha = await sha256Hex(licenseFile);
      const idSha = idFile && idFile.size > 0 ? await sha256Hex(idFile) : "";
      setHashing(false);

      const res = await fetch("/api/lawyers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: String(fd.get("full_name") ?? ""),
          bar_number: String(fd.get("bar_number") ?? ""),
          bar_association: String(fd.get("bar_association") ?? ""),
          license_sha256: licenseSha,
          license_original_name: licenseFile.name,
          id_sha256: idSha,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      loadApps();
    } catch {
      setError(t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold text-brand-950">{t.lawyerJoin.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.lawyerJoin.subtitle}</p>

      {done ? (
        <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm font-bold text-brand-800">✅ {t.lawyerJoin.success}</p>
      ) : (
        <form onSubmit={submit} className="card mt-6 grid gap-4">
          <label className="block">
            <span className="label">{t.lawyerJoin.fullName} *</span>
            <input name="full_name" required minLength={3} maxLength={160} className="input" />
          </label>
          <label className="block">
            <span className="label">{t.lawyerJoin.barNumber} *</span>
            <input name="bar_number" required dir="ltr" maxLength={60} className="input" />
          </label>
          <label className="block">
            <span className="label">{t.lawyerJoin.barAssociation}</span>
            <input name="bar_association" defaultValue="نقابة المحامين النظاميين الأردنيين" maxLength={160} className="input" />
          </label>
          <label className="block">
            <span className="label">{t.lawyerJoin.licenseLabel} *</span>
            <input name="license" type="file" required accept=".pdf,image/*" className="input !py-2" />
          </label>
          <label className="block">
            <span className="label">{t.lawyerJoin.idDocLabel}</span>
            <input name="id_doc" type="file" accept=".pdf,image/*" className="input !py-2" />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
          )}
          <button type="submit" disabled={busy || hashing} className="btn-primary w-full">
            {hashing ? t.lawyerJoin.hashing : busy ? t.lawyerJoin.submitting : t.lawyerJoin.submit}
          </button>
        </form>
      )}

      {apps.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-stone-500">
            {t.lawyerJoin.statusTitle}
          </h2>
          <ul className="grid gap-2">
            {apps.map((a) => (
              <li key={a.id} className="card flex items-center justify-between !p-4 text-sm">
                <span className="font-semibold text-stone-800">{a.full_name}</span>
                <span className={
                  a.status === "approved" ? "font-bold text-brand-700" : a.status === "rejected" ? "font-bold text-red-700" : "font-bold text-amber-600"
                }>
                  {a.status === "approved"
                    ? t.lawyerJoin.stApproved
                    : a.status === "rejected"
                      ? t.lawyerJoin.stRejected
                      : t.lawyerJoin.stPending}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
