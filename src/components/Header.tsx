"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, useCaseAccess } from "@/lib/auth";

export default function Header() {
  const { t, locale, toggleLocale } = useI18n();
  const { user, ready, logout } = useAuth();
  const { paid } = useCaseAccess();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const caseLocked = Boolean(user?.verified) && !paid;
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/rights", label: t.nav.rights },
    { href: "/workflow", label: t.nav.workflow, lock: caseLocked },
    { href: "/complaints", label: t.nav.complaints, lock: caseLocked },
    { href: "/stories", label: t.nav.stories },
    { href: "/privacy", label: t.nav.privacy },
  ];

  async function doLogout() {
    setMenu(false);
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur print:hidden">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label={t.meta.brand}>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-extrabold text-white"
          >
            ح
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-brand-800">{t.meta.brand}</span>
            <span className="hidden text-[11px] font-medium text-stone-500 sm:block">
              {t.meta.tagline}
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === l.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {"lock" in l && l.lock ? "🔒 " : ""}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {locale === "ar" ? "EN" : "عربي"}
          </button>

          {!ready ? null : user === null ? (
            <>
              <Link href="/auth/login" className="btn-secondary !px-3 !py-1.5 !text-sm">
                {t.auth.btnLogin}
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary hidden !px-3 !py-1.5 !text-sm sm:inline-flex"
              >
                {t.auth.goRegister}
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-800">
                  {(user.name ?? user.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate sm:block">
                  {user.name ?? user.email}
                </span>
                {!user.verified && <span title={t.auth.verifyTitle}>⏳</span>}
              </button>
              {menu && (
                <div className="absolute end-0 top-full z-50 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-card">
                  <p className="truncate px-3 py-1.5 text-xs text-stone-400">{user.email}</p>
                  {!user.verified && (
                    <Link
                      href="/auth/verify"
                      onClick={() => setMenu(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      ⏳ {t.auth.verifyTitle}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={doLogout}
                    className="w-full rounded-lg px-3 py-2 text-start text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    {t.auth.logout}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost lg:hidden"
            aria-expanded={open}
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-stone-100 bg-white lg:hidden">
          <div className="container-page grid gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname === l.href ? "bg-brand-50 text-brand-700" : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                {"lock" in l && l.lock ? "🔒 " : ""}
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
