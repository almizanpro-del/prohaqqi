"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, useCaseAccess } from "@/lib/auth";
import { useCasePlatform } from "@/lib/case-store";

type NavItem = { href: string; label: string; lock?: boolean };

export default function Header() {
  const { t, locale, toggleLocale } = useI18n();
  const { user, ready, logout } = useAuth();
  const { paid } = useCaseAccess();
  const { unreadCount: unread } = useCasePlatform();
  const pathname = usePathname();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const caseLocked = Boolean(user?.verified) && !paid;

  /* ---- full link set (every page reachable) ---- */
  const mainLinks: NavItem[] = [
    { href: "/", label: t.nav.home },
    ...(user?.verified ? [{ href: "/dashboard", label: t.nav.dashboard }] : []),
    { href: "/rights", label: t.nav.rights },
    { href: "/workflow", label: t.nav.workflow, lock: caseLocked },
    { href: "/complaints", label: t.nav.complaints, lock: caseLocked },
    { href: "/stories", label: t.nav.stories },
    { href: "/pricing", label: t.nav.pricing },
  ];
  const secondaryLinks: NavItem[] = [
    ...(user?.verified ? [{ href: "/notifications", label: t.nav.notifications }] : []),
    ...(user?.verified ? [{ href: "/join-as-lawyer", label: t.nav.joinLawyer }] : []),
    ...(user?.verified ? [{ href: "/admin", label: t.nav.admin }] : []),
    { href: "/privacy", label: t.nav.privacy },
    { href: "/terms", label: t.footer.termsLink },
  ];

  /* lock body scroll + close on Escape while the drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  function go(href: string) {
    setDrawerOpen(false);
    router.push(href);
  }

  async function doLogout() {
    setDrawerOpen(false);
    await logout();
    router.push("/");
  }

  const linkCls = (href: string) =>
    `whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold transition ${
      pathname === href
        ? "bg-brand-50 text-brand-700"
        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur print:hidden">
        {/* ---------- top row ---------- */}
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-2 px-3 lg:h-auto lg:flex-wrap lg:py-1.5">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={t.meta.brand}>
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-extrabold text-white"
            >
              ح
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold text-brand-800">{t.meta.brand}</span>
              <span className="hidden text-[10px] font-medium text-stone-400 xl:block">
                {t.meta.tagline}
              </span>
            </span>
          </Link>

          {/* desktop nav — every page */}
          <nav
            aria-label="Main"
            className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-0.5 gap-y-0.5 lg:flex"
          >
            {[...mainLinks, ...secondaryLinks].map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                {"lock" in l && l.lock ? "🔒 " : ""}
                {l.label}
              </Link>
            ))}
          </nav>

          {/* actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {!ready ? null : user === null ? (
              <>
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  {locale === "ar" ? "EN" : "عربي"}
                </button>
                <Link href="/auth/login" className="btn-secondary !px-3 !py-1.5 !text-xs">
                  {t.auth.btnLogin}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary hidden !px-3 !py-1.5 !text-xs sm:inline-flex"
                >
                  {t.auth.goRegister}
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  {locale === "ar" ? "EN" : "عربي"}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    aria-label={t.nav.dashboard}
                    className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-800"
                  >
                    {(user.name ?? user.email).slice(0, 1).toUpperCase()}
                  </button>
                  {!user.verified && (
                    <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-ghost !px-2 lg:hidden"
              aria-expanded={drawerOpen}
              aria-label={t.nav.menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ================= mobile drawer ================= */}
      <div
        className={`fixed inset-0 z-[55] bg-black/40 transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menuOpen}
        className={`fixed inset-y-0 right-0 z-[60] flex w-[310px] max-w-[88vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <p className="text-lg font-extrabold text-brand-800">{t.meta.brand}</p>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t.nav.menuClose}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile">
          <DrawerGroup>
            {mainLinks.map((l) => (
              <DrawerLink key={l.href} {...l} active={pathname === l.href} onClick={() => go(l.href)} />
            ))}
          </DrawerGroup>

          {user?.verified && (
            <DrawerGroup>
              <DrawerLink href="/notifications" label={`🔔 ${t.nav.notifications}`} badge={unread || undefined} active={pathname === "/notifications"} onClick={() => go("/notifications")} />
              <DrawerLink href="/join-as-lawyer" label={`⚖️ ${t.nav.joinLawyer}`} active={pathname === "/join-as-lawyer"} onClick={() => go("/join-as-lawyer")} />
              <DrawerLink href="/admin" label={`🛠️ ${t.nav.admin}`} active={pathname === "/admin"} onClick={() => go("/admin")} />
            </DrawerGroup>
          )}

          <DrawerGroup>
            {secondaryLinks
              .filter((l) => l.href !== "/notifications")
              .map((l) => (
                <DrawerLink key={l.href} {...l} active={pathname === l.href} onClick={() => go(l.href)} />
              ))}
          </DrawerGroup>
        </nav>

        <div className="border-t border-stone-100 p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          {user ? (
            <div className="grid gap-2">
              <p dir="ltr" className="truncate px-1 text-xs text-stone-400">{user.email}</p>
              <button type="button" onClick={doLogout} className="w-full rounded-xl bg-red-50 px-3 py-2.5 text-start text-sm font-bold text-red-700">
                {t.auth.logout}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/auth/login" onClick={() => setDrawerOpen(false)} className="btn-secondary w-full">{t.auth.btnLogin}</Link>
              <Link href="/auth/register" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">{t.auth.goRegister}</Link>
            </div>
          )}
        </div>
      </aside>

      {/* ================= bottom app bar (mobile) ================= */}
      <BottomBar onMore={() => setDrawerOpen(true)} />
    </>
  );
}

/* ------------------------- bottom bar ------------------------- */

function BottomBar({ onMore }: { onMore: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { unreadCount: unread } = useCasePlatform();
  const pathname = usePathname();

  const items = [
    { href: "/", icon: "🏠", label: t.nav.home },
    user?.verified
      ? { href: "/dashboard", icon: "📁", label: t.nav.dashboard }
      : { href: "/auth/login", icon: "📁", label: t.nav.dashboard },
    { href: "/workflow", icon: "📋", label: t.nav.workflow },
    { href: "/complaints", icon: "✍️", label: t.nav.complaints },
  ];

  return (
    <nav
      aria-label={t.nav.more}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${
                active ? "text-brand-700" : "text-stone-400"
              }`}
            >
              <span className="text-lg leading-none">{it.icon}</span>
              <span className="max-w-full truncate px-0.5">{it.label}</span>
              {active && <span className="h-0.5 w-6 rounded-full bg-brand-600" />}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-stone-400 transition hover:text-brand-700"
        >
          <span className="relative text-lg leading-none">
            ☰
            {unread > 0 && (
              <span className="absolute -end-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-extrabold text-white">
                {unread}
              </span>
            )}
          </span>
          <span>{t.nav.more}</span>
        </button>
      </div>
    </nav>
  );
}

/* ------------------------- drawer bits ------------------------- */

function DrawerGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 grid gap-0.5 rounded-2xl bg-sand-50 p-1.5">{children}</div>;
}

function DrawerLink({
  href,
  label,
  lock,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  lock?: boolean;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
        active ? "bg-white text-brand-700 shadow-card" : "text-stone-600 active:bg-stone-100"
      }`}
    >
      <span>
        {lock ? "🔒 " : ""}
        {label}
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
