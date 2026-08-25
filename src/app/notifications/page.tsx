"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { RequireVerified } from "@/components/AuthGate";
import { useCasePlatform } from "@/lib/case-store";

export default function NotificationsPage() {
  return (
    <RequireVerified>
      <Inner />
    </RequireVerified>
  );
}

function Inner() {
  const { t } = useI18n();
  const p = useCasePlatform();

  return (
    <div className="mx-auto max-w-xl">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-950">🔔 {t.platform.notifTitle}</h1>
        {p.notifications.length > 0 && (
          <button type="button" onClick={p.markNotificationsRead} className="btn-secondary !py-1.5 !text-xs">
            ✓ {t.platform.notifMarkRead}
          </button>
        )}
      </header>

      {p.notifications.length === 0 ? (
        <p className="card mt-6 text-center text-sm text-stone-500">{t.platform.notifEmpty}</p>
      ) : (
        <ul className="mt-6 grid gap-2">
          {p.notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={p.markNotificationsRead}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition hover:bg-stone-50 ${
                  n.urgent ? "border-red-300 bg-red-50 font-bold text-red-800" : "border-stone-200 bg-white text-stone-700"
                }`}
              >
                <span>{n.text}</span>
                {!p.markNotificationsRead && null}
                <span aria-hidden>←</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
