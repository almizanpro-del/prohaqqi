"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth, useCaseAccess } from "@/lib/auth";
import { useCasePlatform, type DeadlineRow } from "@/lib/case-store";
import { RequireVerified } from "@/components/AuthGate";
import CrisisNote from "@/components/CrisisNote";
import { getBrowserSupabase } from "@/lib/supabase";

type Tab = "overview" | "deadlines" | "evidence" | "access";

type AccessLike = {
  id: string;
  role: string;
  status: string;
  email?: string | null;
  invited_email?: string | null;
};

export default function DashboardPage() {
  return (
    <RequireVerified>
      <DashboardInner />
    </RequireVerified>
  );
}

function DashboardInner() {
  const { t, locale } = useI18n();
  const { user, mode } = useAuth();
  const p = useCasePlatform();
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "overview";
    return ((new URLSearchParams(window.location.search).get("tab") as Tab) || "overview");
  });
  const [label, setLabel] = useState("");
  const [accDate, setAccDate] = useState("");
  const [busy, setBusy] = useState(false);

  const tabs: Tab[] = ["overview", "deadlines", "evidence", "access"];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!accDate) return;
    setBusy(true);
    try {
      await p.createCase({ label, accident_date: accDate, injuries: "none" });
      setLabel("");
      setAccDate("");
    } finally {
      setBusy(false);
    }
  }

  function exportData() {
    const payload = {
      exported_at: new Date().toISOString(),
      account_email: user?.email,
      cases: p.cases,
      active_case_access: p.access,
      deadlines: p.deadlines,
      evidence_metadata: p.evidence,
      note:
        mode === "demo"
          ? "Demo export covers browser-local data only."
          : "Server-side records for your account are compiled here; raw document bytes remain in private storage.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "haqqi-my-data.json";
    a.click();
  }

  if (!p.ready) return <p className="py-24 text-center text-sm text-stone-400">…</p>;

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-950">{t.platform.dashboardTitle}</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-600">{t.platform.dashboardSub}</p>
        </div>
        <Link href="/notifications" className="btn-secondary !py-2 !text-xs">
          🔔 {t.nav.notifications}
          {p.unreadCount > 0 && (
            <span className="ms-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {p.unreadCount}
            </span>
          )}
        </Link>
      </header>

      {p.cases.length === 0 ? (
        <section className="card mx-auto w-full max-w-lg text-center">
          <h2 className="text-xl font-extrabold text-stone-900">{t.platform.noCaseTitle}</h2>
          <p className="mt-2 text-sm text-stone-600">{t.platform.noCaseBody}</p>
          <form onSubmit={create} className="mx-auto mt-6 grid max-w-sm gap-4 text-start">
            <label className="block">
              <span className="label">{t.platform.caseLabel}</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={160} className="input" />
            </label>
            <label className="block">
              <span className="label">{t.workflow.accidentDate} *</span>
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={accDate}
                onChange={(e) => setAccDate(e.target.value)}
                className="input"
              />
            </label>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? t.common.submitting : `＋ ${t.platform.createBtn}`}
            </button>
          </form>
        </section>
      ) : (
        <>
          {p.cases.length > 1 && (
            <select
              value={p.active?.id ?? ""}
              onChange={(e) => p.setActive(e.target.value)}
              className="input max-w-md"
              aria-label={t.platform.caseLabel}
            >
              {p.cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || c.id.slice(0, 8)} — {c.accident_date}
                </option>
              ))}
            </select>
          )}

          <div role="tablist" className="flex flex-wrap gap-2">
            {tabs.map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={tab === k ? "chip chip-active" : "chip"}>
                {t.platform.tabs[k]}
              </button>
            ))}
          </div>

          {tab === "overview" && <OverviewTab onExport={exportData} />}
          {tab === "deadlines" && <DeadlinesTab locale={locale} />}
          {tab === "evidence" && <EvidenceTab demo={mode === "demo"} locale={locale} />}
          {tab === "access" && <AccessTab demo={mode === "demo"} myEmail={user!.email.toLowerCase()} />}
        </>
      )}
    </div>
  );
}

/* ------------------------------ helpers ------------------------------ */

function daysUntil(iso: string): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((new Date(iso + "T00:00:00Z").getTime() - todayUtc) / 86400000);
}

function fmt(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(new Date(iso.length > 10 ? iso : iso + "T00:00:00Z"));
  } catch {
    return iso;
  }
}

function deadlineLabel(d: DeadlineRow, t: ReturnType<typeof useI18n>["t"]): string {
  if (d.title) return d.title;
  const map = t.platform.deadlineKinds as Record<string, string>;
  return map[d.kind] ?? d.kind;
}

function CountdownBadge({ daysLeft }: { daysLeft: number }) {
  const { t } = useI18n();
  if (daysLeft < 0)
    return (
      <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
        {t.platform.dlOverdue} {Math.abs(daysLeft)} {t.platform.dlDays}
      </span>
    );
  const cls =
    daysLeft <= 7
      ? "bg-red-100 text-red-700"
      : daysLeft <= 30
        ? "bg-amber-100 text-amber-700"
        : "bg-stone-100 text-stone-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${cls}`}>
      {daysLeft} {t.platform.dlDays}
    </span>
  );
}

/* ------------------------------ Overview ------------------------------ */

function OverviewTab({ onExport }: { onExport: () => void }) {
  const { t, locale } = useI18n();
  const { paid } = useCaseAccess();
  const p = useCasePlatform();

  const upcoming = useMemo(
    () =>
      [...p.deadlines]
        .filter((d) => !d.completed_at)
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 3),
    [p.deadlines]
  );

  const crisisSeed =
    p.active?.injuries === "death" ? "death وفاة" : p.active?.injuries === "severe" ? "severe إصابة خطيرة" : "";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card grid content-start gap-4 lg:col-span-2">
        <CrisisNote text={crisisSeed} />

        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"}`}>
            {paid ? t.platform.payChipPaid : t.platform.payChipLocked}
          </span>
          {!paid && (
            <Link href="/pay" className="btn-primary !py-1.5 !text-xs">
              {t.platform.activateCta}
            </Link>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/workflow" className="btn-secondary justify-between">📋 {t.platform.quickPlan} ←</Link>
          <Link href="/complaints" className="btn-secondary justify-between">✍️ {t.platform.quickComplaints} ←</Link>
        </div>

        <h3 className="mt-2 text-sm font-extrabold uppercase tracking-wide text-stone-500">
          ⏱️ {t.platform.tabs.deadlines}
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-stone-500">{t.platform.dlEmpty}</p>
        ) : (
          <ul className="grid gap-2">
            {upcoming.map((d) => {
              const left = daysUntil(d.due_date);
              return (
                <li
                  key={d.id}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    left < 0 ? "border-red-300 bg-red-50" : left <= 30 ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-stone-800">{deadlineLabel(d, t)}</span>
                    <CountdownBadge daysLeft={left} />
                  </div>
                  <p className="mt-1 text-xs text-stone-500">📆 {fmt(d.due_date, locale)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="card grid content-start gap-4">
        <div>
          <p className="label !mb-1">{t.platform.myRole}</p>
          <p className="font-bold text-stone-800">
            {t.platform.roles[p.access.find((a) => a.status === "active")?.role ?? "owner"]}
          </p>
        </div>
        <div>
          <p className="label !mb-1">{t.platform.tabs.access}</p>
          <p className="text-sm text-stone-600">
            {p.access.filter((a) => a.status !== "pending_invite").length || t.platform.accNone}
          </p>
        </div>
        <button type="button" onClick={onExport} className="btn-secondary !py-2 !text-xs">
          ⬇️ {t.platform.exportBtn}
        </button>
      </aside>
    </div>
  );
}

/* ------------------------------ Deadlines ------------------------------ */

function DeadlinesTab({ locale }: { locale: string }) {
  const { t } = useI18n();
  const p = useCasePlatform();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  function gcalUrl(d: DeadlineRow) {
    const label = deadlineLabel(d, t);
    const ymd = d.due_date.replaceAll("-", "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Haqqi — ${label}`
    )}&dates=${ymd}/${ymd}`;
  }

  return (
    <div className="grid gap-6">
      <ul className="grid gap-3">
        {[...p.deadlines]
          .sort(
            (a, b) =>
              Number(Boolean(a.completed_at)) - Number(Boolean(b.completed_at)) ||
              a.due_date.localeCompare(b.due_date)
          )
          .map((d) => {
            const done = Boolean(d.completed_at);
            const left = daysUntil(d.due_date);
            return (
              <li
                key={d.id}
                className={`card flex flex-wrap items-center justify-between gap-3 !p-4 ${
                  done ? "opacity-60" : left < 0 ? "!border-red-300 bg-red-50" : ""
                }`}
              >
                <div>
                  <p className="font-bold text-stone-900">{deadlineLabel(d, t)}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
                    📆 {fmt(d.due_date, locale)}
                    {!done && <CountdownBadge daysLeft={left} />}
                    {done && <span className="font-bold text-brand-700">✓ {t.platform.dlDone}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  {!done && (
                    <a href={gcalUrl(d)} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-1.5 !text-xs">
                      📅 {t.platform.dlGcal}
                    </a>
                  )}
                  <button type="button" onClick={() => p.toggleDeadline(d.id)} aria-label={t.platform.dlDone} className="btn-secondary !px-3 !py-1.5 !text-xs">
                    ✓
                  </button>
                </div>
              </li>
            );
          })}
      </ul>

      <form
        className="card grid gap-4 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title || !due) return;
          p.addCustomDeadline(title, due);
          setTitle("");
          setDue("");
        }}
      >
        <h3 className="text-sm font-bold text-stone-700 sm:col-span-3">＋ {t.platform.dlAddTitle}</h3>
        <label className="block">
          <span className="label">{t.platform.dlTitleLabel}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="input" />
        </label>
        <label className="block">
          <span className="label">{t.platform.dlDueLabel}</span>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} required className="input" />
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn-primary">＋</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------ Evidence ------------------------------ */

function EvidenceTab({ demo, locale }: { demo: boolean; locale: string }) {
  const { t } = useI18n();
  const p = useCasePlatform();
  const [hashing, setHashing] = useState(false);

  return (
    <div className="grid gap-5">
      <p className="rounded-xl bg-sand-100 p-3 text-xs leading-relaxed text-stone-600">🔒 {t.platform.evNote}</p>

      <label className="card cursor-pointer border-dashed text-center">
        <input
          type="file"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setHashing(true);
            for (const f of files) await p.addEvidence(f);
            setHashing(false);
            e.target.value = "";
          }}
        />
        <p className="py-6 text-sm font-semibold text-brand-700">
          {hashing ? t.lawyerJoin.hashing : `📎 ${t.platform.evPick}`}
        </p>
      </label>

      {p.evidence.length === 0 ? (
        <p className="text-sm text-stone-500">{t.platform.evEmpty}</p>
      ) : (
        <ul className="grid gap-2">
          {p.evidence.map((e) => (
            <li key={e.id} className="card !p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-stone-800">{e.original_name}</span>
                <span className="text-xs text-stone-400">{fmt(e.uploaded_at.slice(0, 10), locale)}</span>
              </div>
              <p dir="ltr" className="mt-1 break-all font-mono text-[11px] text-stone-400">
                SHA-256: {e.sha256}
              </p>
            </li>
          ))}
        </ul>
      )}
      {demo && <p className="text-xs text-stone-400">🧪 {t.pay.demoBoxTitle}</p>}
    </div>
  );
}

/* ------------------------------ Access ------------------------------ */

function AccessTab({ demo, myEmail }: { demo: boolean; myEmail: string }) {
  const { t } = useI18n();
  const p = useCasePlatform();
  const [invEmail, setInvEmail] = useState("");
  const [role, setRole] = useState<"family_rep" | "lawyer" | "viewer">("family_rep");
  const [invitesForMe, setInvitesForMe] = useState<AccessLike[]>([]);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    (async () => {
      try {
        const sb = getBrowserSupabase();
        if (!sb) return;
        const { data } = await sb.auth.getSession();
        const res = await fetch("/api/cases/access?scope=mine_invites", {
          headers: data.session?.access_token
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : {},
        });
        const json = await res.json();
        if (!cancelled) setInvitesForMe(json.access ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  function renderEntry(a: AccessLike) {
    const label = a.email ?? a.invited_email ?? "—";
    return (
      <li key={a.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
        <div>
          <p dir="ltr" className="font-semibold text-stone-800">{label}</p>
          <p className="mt-0.5 text-xs">
            <span className="font-bold text-brand-700">
              {t.platform.roles[a.role as keyof typeof t.platform.roles] ?? a.role}
            </span>{" "}
            <span
              className={
                a.status === "active"
                  ? "text-brand-700"
                  : a.status === "revoked"
                    ? "text-red-600 line-through"
                    : "text-amber-600"
              }
            >
              ·{" "}
              {a.status === "active"
                ? t.platform.accActiveTag
                : a.status === "revoked"
                  ? t.platform.accRevokedTag
                  : t.platform.accPendingTag}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {a.status === "pending_invite" && a.invited_email?.toLowerCase() === myEmail && (
            <button type="button" onClick={() => p.acceptInvite(a.id)} className="btn-primary !px-3 !py-1.5 !text-xs">
              ✓ {t.platform.accAccept}
            </button>
          )}
          {a.email && a.status !== "revoked" && a.role !== "owner" && (
            <button
              type="button"
              onClick={() => p.revokeMember(a.id)}
              className="btn-secondary !px-3 !py-1.5 !text-xs !text-red-700"
            >
              ✕ {t.platform.accRevoke}
            </button>
          )}
        </div>
      </li>
    );
  }

  const members = p.access.filter((a) => a.status !== "pending_invite");
  const pendingSent = p.access.filter((a) => a.status === "pending_invite");

  return (
    <div className="grid gap-6">
      <form
        className="card grid gap-4 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!invEmail.includes("@")) return;
          p.inviteMember(invEmail, role);
          setInvEmail("");
        }}
      >
        <h3 className="text-sm font-bold text-stone-700 sm:col-span-3">👥 {t.platform.accInviteTitle}</h3>
        <label className="block">
          <span className="label">{t.platform.accEmail}</span>
          <input type="email" dir="ltr" required value={invEmail} onChange={(e) => setInvEmail(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="label">Role / الدور</span>
          <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="input">
            <option value="family_rep">{t.platform.roles.family_rep}</option>
            <option value="lawyer">{t.platform.roles.lawyer}</option>
            <option value="viewer">{t.platform.roles.viewer}</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn-primary">➤</button>
        </div>
      </form>

      {demo && <p className="text-xs text-stone-400">🧪 {t.platform.accDemoNote}</p>}

      {invitesForMe.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-amber-700">📬 {t.platform.accForMe}</h3>
          <ul className="grid gap-2">
            {invitesForMe.map((iv) =>
              renderEntry({
                id: iv.id,
                role: iv.role,
                status: iv.status,
                invited_email: (iv as unknown as { invited_email?: string }).invited_email ?? "",
              })
            )}
          </ul>
        </section>
      )}

      <section>
        <ul className="grid gap-2">
          {members.length === 0 ? <p className="text-sm text-stone-500">{t.platform.accNone}</p> : members.map(renderEntry)}
          {pendingSent.map((a) => renderEntry({ id: a.id, role: a.role, status: a.status, invited_email: a.email ?? "" }))}
        </ul>
      </section>
    </div>
  );
}
