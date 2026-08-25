"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

function GateCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg card text-center my-16">
      {children}
    </div>
  );
}

/** Blocks render until a registered user with a confirmed email is present. */
export function RequireVerified({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, ready, mode } = useAuth();

  if (!ready) {
    return <p className="py-24 text-center text-sm text-stone-400">…</p>;
  }

  if (!user) {
    return (
      <GateCard>
        <h1 className="text-xl font-extrabold text-stone-900">{t.auth.gateLoginTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.auth.gateLoginBody}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/auth/login" className="btn-primary">{t.auth.btnLogin}</Link>
          <Link href="/auth/register" className="btn-secondary">{t.auth.goRegister}</Link>
        </div>
        {mode === "demo" && (
          <p className="mt-6 rounded-xl bg-stone-100 p-3 text-xs leading-relaxed text-stone-500">
            🧪 {t.pay.demoBoxTitle}
          </p>
        )}
      </GateCard>
    );
  }

  if (!user.verified) {
    return (
      <GateCard>
        <h1 className="text-xl font-extrabold text-stone-900">{t.auth.gateVerifyTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.auth.gateVerifyBody}</p>
        <Link href="/auth/verify" className="btn-primary mt-6">{t.auth.verifyTitle}</Link>
      </GateCard>
    );
  }

  return <>{children}</>;
}
