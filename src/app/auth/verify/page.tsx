"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function VerifyPage() {
  const { t } = useI18n();
  const { user, mode, logout, demoVerifyEmail } = useAuth();
  const [resent, setResent] = useState(false);

  return (
    <div className="mx-auto my-10 max-w-lg text-center">
      <div className="card grid gap-5 py-10">
        <p className="text-5xl">📧</p>
        <h1 className="text-2xl font-extrabold text-stone-900">{t.auth.verifyTitle}</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-600">
          {t.auth.verifyBody}
        </p>
        <p dir="ltr" className="text-sm font-bold text-brand-700">
          {user?.email}
        </p>

        {mode === "demo" && (
          <div className="rounded-xl bg-amber-50 p-4 text-start">
            <p className="text-xs leading-relaxed text-amber-900">🧪 {t.auth.demoModeNote}</p>
            {!user?.verified ? (
              <button type="button" onClick={demoVerifyEmail} className="btn-primary mt-3 !py-2 !text-xs">
                {t.auth.demoVerifyBtn}
              </button>
            ) : (
              <Link href="/workflow" className="btn-primary mt-3 !py-2 !text-xs">
                ✓ → {t.workflow.title}
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 border-t border-stone-100 pt-5">
          <button
            type="button"
            onClick={() => setResent(true)}
            disabled={mode === "demo"}
            title={mode === "demo" ? t.pay.demoBoxTitle : undefined}
            className="btn-secondary !py-2 !text-xs disabled:opacity-40"
          >
            {resent ? t.auth.verifyResent : t.auth.verifyResend}
          </button>
          <Link href="/auth/login" onClick={() => logout()} className="btn-ghost !text-xs">
            {t.auth.logout}
          </Link>
        </div>
      </div>
    </div>
  );
}
