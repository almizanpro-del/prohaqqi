"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase";

type Overview = {
  demo: boolean;
  payments: Array<{ id: string; cliq_reference: string; amount_jod: number | string }>;
  stories: Array<{ id: string; description: string; insurer_name: string | null }>;
  lawyer_applications: Array<{ id: string; full_name: string; bar_number: string }>;
  deletion_requests: Array<{ id: string; email: string; details: string | null }>;
  audit_logs?: Array<{ id: number; action: string; entity: string; created_at: string }>;
};

type Tab = keyof Overview extends never ? never : "payments" | "stories" | "lawyers" | "deletions" | "audit";

export default function AdminPage() {
  const { t } = useI18n();
  const { user, ready, mode } = useAuth();
  const [tab, setTab] = useState<Tab>("payments");
  const [data, setData] = useState<Overview | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!ready || !user?.verified) return;
    (async () => {
      try {
        const sb = getBrowserSupabase();
        let headers: Record<string, string> = {};
        if (sb) {
          const { data: s } = await sb.auth.getSession();
          if (s.session?.access_token) headers = { Authorization: `Bearer ${s.session.access_token}` };
        }
        const res = await fetch("/api/admin/overview", { headers });
        if (res.status === 403) {
          setForbidden(true);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setForbidden(true);
      }
    })();
  }, [ready, user?.verified]);

  async function act(entity: string, id: string, action: string) {
    try {
      const sb = getBrowserSupabase();
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sb) {
        const { data: s } = await sb.auth.getSession();
        if (s.session?.access_token)
          headers = { ...headers, Authorization: `Bearer ${s.session.access_token}` };
      }
      await fetch("/api/admin/action", {
        method: "POST",
        headers,
        body: JSON.stringify({ entity, id, action }),
      });
    } catch {}
    // refresh local view
    if (data) {
      const keyMap: Record<string, keyof Overview> = {
        payment: "payments",
        story: "stories",
        lawyer_application: "lawyer_applications",
        deletion_request: "deletion_requests",
      };
      const listKey = keyMap[entity];
      if (listKey && Array.isArray(data[listKey])) {
        setData({
          ...data,
          [listKey]: (data[listKey] as Array<{ id: string }>).filter((x) => x.id !== id),
        } as Overview);
      }
    }
  }

  if (!ready || !user?.verified) return <p className="py-24 text-center text-sm text-stone-400">…</p>;

  const tabs: Tab[] = ["payments", "stories", "lawyers", "deletions", "audit"];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-950">🛠️ {t.admin.title}</h1>
        {mode === "demo" && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">
            🧪 {t.admin.demoBanner}
          </p>
        )}
      </header>

      {forbidden ? (
        <div className="card mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold text-stone-700">{t.admin.forbidden}</p>
          <code dir="ltr" className="mt-4 block rounded-xl bg-stone-100 p-3 text-xs">{t.admin.firstAdminHint}</code>
        </div>
      ) : !data ? (
        <p className="py-16 text-center text-sm text-stone-400">…</p>
      ) : (
        <>
          <div role="tablist" className="flex flex-wrap gap-2">
            {tabs.map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={tab === k ? "chip chip-active" : "chip"}>
                {t.admin.tabs[k]}
              </button>
            ))}
          </div>

          {tab === "payments" && (
            <QueueTable
              rows={data.payments.map((p) => ({ id: p.id, primary: p.cliq_reference, secondary: `${Number(p.amount_jod)} JOD` }))}
              emptyText={t.admin.empty}
              actions={[
                { label: `✓ ${t.admin.btnConfirm}`, run: (id) => act("payment", id, "confirm"), cls: "btn-primary" },
                { label: `✕ ${t.admin.btnReject}`, run: (id) => act("payment", id, "reject"), cls: "btn-secondary" },
              ]}
            />
          )}

          {tab === "stories" && (
            <QueueTable
              rows={data.stories.map((s) => ({ id: s.id, primary: s.insurer_name ?? "—", secondary: s.description.slice(0, 120) + "…" }))}
              emptyText={t.admin.empty}
              actions={[
                { label: `✓ ${t.admin.btnApprove}`, run: (id) => act("story", id, "approve"), cls: "btn-primary" },
                { label: `🗑️ ${t.admin.btnDelete}`, run: (id) => act("story", id, "delete"), cls: "btn-secondary" },
              ]}
            />
          )}

          {tab === "lawyers" && (
            <QueueTable
              rows={data.lawyer_applications.map((a) => ({ id: a.id, primary: a.full_name, secondary: a.bar_number }))}
              emptyText={t.admin.empty}
              actions={[
                { label: `✓ ${t.admin.btnApprove}`, run: (id) => act("lawyer_application", id, "approve"), cls: "btn-primary" },
                { label: `✕ ${t.admin.btnReject}`, run: (id) => act("lawyer_application", id, "reject"), cls: "btn-secondary" },
              ]}
            />
          )}

          {tab === "deletions" && (
            <QueueTable
              rows={data.deletion_requests.map((d) => ({ id: d.id, primary: d.email, secondary: d.details ?? "" }))}
              emptyText={t.admin.empty}
              actions={[{ label: `✓ ${t.admin.btnComplete}`, run: (id) => act("deletion_request", id, "complete"), cls: "btn-primary" }]}
            />
          )}

          {tab === "audit" && (
            <div className="grid gap-3">
              <p className="text-xs text-stone-500">{t.admin.auditNote}</p>
              {(data.audit_logs ?? []).length === 0 ? (
                <p className="text-sm text-stone-500">{t.admin.empty}</p>
              ) : (
                <ul className="grid gap-1.5 text-xs">
                  {data.audit_logs!.map((l) => (
                    <li key={l.id} dir="ltr" className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono">
                      [{new Date(l.created_at).toISOString()}] {l.action.toUpperCase()} · {l.entity} · #{String(l.id)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QueueTable({
  rows,
  actions,
  emptyText,
}: {
  rows: Array<{ id: string; primary: string; secondary?: string }>;
  actions: Array<{ label: string; run: (id: string) => void; cls: string }>;
  emptyText: string;
}) {
  if (rows.length === 0) return <p className="card text-center text-sm text-stone-500">{emptyText}</p>;
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
          <div className="min-w-0">
            <p dir="auto" className="font-semibold text-stone-800">{r.primary}</p>
            {r.secondary && <p dir="auto" className="mt-0.5 truncate text-xs text-stone-500">{r.secondary}</p>}
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            {actions.map((a) => (
              <button key={a.label} type="button" onClick={() => a.run(r.id)} className={`${a.cls} !px-3 !py-1.5 !text-xs`}>
                {a.label}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
