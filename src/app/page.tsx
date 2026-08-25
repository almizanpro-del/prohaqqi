"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CountUp, Reveal } from "@/components/motion";

/* Decorative floating chips — labels only, no invented case data */
const FLOATERS = [
  { icon: "📄", ar: "محضر الشرطة", en: "Police report", cls: "top-[14%] start-[5%]", delay: "0s" },
  { icon: "⚖️", ar: "التقادم ٣ سنوات", en: "3-year limitation", cls: "top-[18%] end-[5%]", delay: "1.2s" },
];

export default function HomePage() {
  const { t, locale, dir } = useI18n();

  const words = t.home.heroTitle.split(" ");
  const badPractices = Object.values(t.complaints.issueOptions);

  return (
    <div className="grid gap-20 pb-10">
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-brand-100 bg-gradient-to-b from-brand-50 via-white to-white px-5 pb-24 pt-16 text-center sm:px-10 lg:pb-28 lg:pt-24">
        {/* aurora blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -start-24 -top-24 h-96 w-96 animate-drift rounded-full bg-brand-300/40 blur-3xl" />
          <div className="absolute -end-32 top-10 h-[28rem] w-[28rem] animate-drift-alt rounded-full bg-sky-300/35 blur-3xl" />
          <div className="absolute bottom-[-6rem] start-1/3 h-80 w-80 animate-drift rounded-full bg-cyan-200/50 blur-3xl" />
        </div>

        {/* floating glass chips */}
        {FLOATERS.map((f) => (
          <div
            key={f.icon}
            aria-hidden
            dir={dir}
            className={`pointer-events-none absolute z-10 hidden select-none items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2.5 text-xs font-bold text-brand-800 shadow-float backdrop-blur-md lg:flex ${f.cls}`}
            style={{ animation: `float 7s ease-in-out infinite`, animationDelay: f.delay }}
          >
            <span className="text-base">{f.icon}</span>
            {locale === "ar" ? f.ar : f.en}
          </div>
        ))}

        <div className="relative">
          <p
            className="mx-auto mb-6 inline-flex animate-pop-in items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-5 py-1.5 text-xs font-bold text-brand-700 backdrop-blur"
            style={{ animationDelay: "0.05s" }}
          >
            ✦ {t.home.heroKicker}
          </p>

          {/* staggered word-by-word headline */}
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.25] text-brand-950 sm:text-5xl lg:text-6xl">
            {words.map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="inline-block animate-word-rise"
                style={{ animationDelay: `${0.12 + i * 0.09}s` }}
              >
                {i === words.length - 1 ? (
                  <span className="gradient-text">{w}</span>
                ) : (
                  w
                )}
                {"\u00A0"}
              </span>
            ))}
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-stone-600"
            style={{ animationDelay: `${0.12 + words.length * 0.09 + 0.15}s` }}
          >
            {t.home.heroSubtitle}
          </p>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animation: `fade-up .8s ease-out both`, animationDelay: `${0.12 + words.length * 0.09 + 0.3}s` }}
          >
            <Link href="/workflow" className="btn-primary shine !rounded-2xl !px-8 !py-4 !text-base animate-pulse-ring">
              🚀 {t.home.ctaPlan}
            </Link>
            <Link href="/rights" className="btn-secondary !rounded-2xl !px-7 !py-4 !text-base">
              {t.home.ctaRights}
            </Link>
          </div>

          <ul
            className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-semibold text-stone-500"
            style={{ animation: `fade-up .9s ease-out both`, animationDelay: "0.9s" }}
          >
            {[t.home.trustBadge1, t.home.trustBadge2, t.home.trustBadge3].map((b, i) => (
              <li key={b} className="flex items-center gap-1.5">
                <span className="animate-pop-in" style={{ animationDelay: `${1 + i * 0.15}s` }}>
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-5 left-1/2 -translate-x-1/2 text-brand-400">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-bounce-soft">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ===================== BAD-PRACTICE MARQUEE ===================== */}
      <section aria-hidden className="select-none">
        <div className="overflow-hidden border-y border-brand-100 bg-white/70 py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max items-center gap-10 animate-marquee will-change-transform hover:[animation-play-state:paused]">
            {[...badPractices, ...badPractices].map((p, i) => (
              <span key={`${p}-${i}`} className="flex items-center gap-3 whitespace-nowrap text-sm font-bold text-stone-400" dir="auto">
                <span className="line-through decoration-red-400/70 decoration-2">{p}</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs text-brand-700">✓</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section aria-labelledby="how-title" className="relative">
        <Reveal>
          <h2 id="how-title" className="text-center text-3xl font-extrabold text-stone-900 sm:text-4xl">
            {t.home.howTitle}
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* connector line (desktop) */}
          <div aria-hidden className="absolute inset-x-24 top-14 hidden border-t-[3px] border-dashed border-brand-200 md:block">
            <div className="h-[3px] w-full origin-left animate-line-grow bg-gradient-to-r from-brand-500 via-sky-400 to-cyan-300" />
          </div>

          {t.home.howSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 160}>
              <div className="card group relative h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-xl font-extrabold text-white shadow-card transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    {["📋", "🗂️", "📨"][i]}
                  </span>
                  <span className="text-5xl font-extrabold text-brand-100 transition-colors group-hover:text-brand-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================== KEY NUMBERS (count-up) ====================== */}
      <section aria-labelledby="nums-title">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-950 p-8 text-white sm:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -end-20 -top-20 h-72 w-72 animate-drift rounded-full bg-brand-500/40 blur-3xl" />
              <div className="absolute -bottom-24 -start-16 h-72 w-72 animate-drift-alt rounded-full bg-sky-500/30 blur-3xl" />
            </div>

            <h2 id="nums-title" className="relative text-2xl font-extrabold sm:text-3xl">
              🔢 {t.home.ceilingsTeaserTitle}
            </h2>

            <div className="relative mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-transform duration-300 hover:scale-[1.03]">
                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  ≈ <CountUp to={20000} locale={locale} />
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-200">{locale === "ar" ? "سقف الوفاة أو العجز الكلي الدائم" : "Death / total disability cap"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-transform duration-300 hover:scale-[1.03]" style={{ transitionDelay: "80ms" }}>
                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  ≈ <CountUp to={100} locale={locale} />
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-200">{locale === "ar" ? "دينار / أسبوع للعجز المؤقت" : "JOD / week for temporary disability"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-transform duration-300 hover:scale-[1.03]" style={{ transitionDelay: "160ms" }}>
                <p className="animate-pop-in text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ animationDelay: ".4s" }} dir="ltr">
                  5–10
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-200">{t.common.workingDays} · {locale === "ar" ? "موعد السداد القانوني" : "legal payment window"}</p>
              </div>
            </div>

            <p className="relative mt-8 max-w-2xl text-xs leading-relaxed text-brand-300">
              {t.home.ceilingsTeaserNote}
            </p>
            <Reveal delay={200}>
              <Link href="/rights" className="btn-primary shine relative mt-8 !bg-white !text-brand-900">
                {t.common.seeMore} ←
              </Link>
            </Reveal>
          </div>
        </Reveal>
      </section>

      {/* ======================== PRICING TEASER ======================== */}
      <section aria-labelledby="pricing-teaser">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal dir="left">
            <div className="card h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
              <p className="mb-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
                {locale === "ar" ? "مجاني بعد التسجيل" : "Free after sign-up"}
              </p>
              <p className="text-sm leading-relaxed text-stone-600">🟢 {t.home.pricingTeaserFree}</p>
            </div>
          </Reveal>
          <Reveal dir="right" delay={120}>
            <div className="card h-full border-brand-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
              <p className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-extrabold text-white">
                CliQ · {t.pricing.paidPrice}
              </p>
              <p className="text-sm leading-relaxed text-stone-600">🔵 {t.home.pricingTeaserPaid}</p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <div className="mt-6 flex justify-center">
            <Link href="/pricing" className="btn-secondary">{t.home.pricingCta}</Link>
          </div>
        </Reveal>
      </section>

      {/* ======================= CORRUPTION ALERT ======================= */}
      <section aria-labelledby="corr-title">
        <Reveal>
          <div className="group card relative overflow-hidden border-red-200 bg-red-50/70">
            <div aria-hidden className="absolute -end-10 -top-10 h-40 w-40 animate-pulse-ring rounded-full bg-red-200/50 blur-2xl" />
            <h2 id="corr-title" className="relative flex items-center gap-3 text-2xl font-extrabold text-red-800">
              <span className="inline-block animate-wiggle text-3xl">🚨</span>
              {t.home.corruptionAlertTitle}
            </h2>
            <p className="relative mt-3 max-w-3xl text-sm leading-loose text-red-900/90">
              {t.home.corruptionAlertBody}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ========================= STORIES TEASER ========================= */}
      <section aria-labelledby="stories-teaser">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <Reveal dir="left">
            <div className="relative mx-auto h-60 max-w-sm">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden
                  className={`absolute inset-x-4 top-4 h-40 rounded-3xl border border-brand-100 bg-white p-5 shadow-float ${
                    i === 2 ? "!inset-x-0 top-0 z-20" : ""
                  }`}
                  style={{
                    transform: `rotate(${(i - 1) * 4}deg) translateY(${i * 8}px)`,
                    zIndex: i,
                    animation: `float-slow ${8 + i * 1.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.6}s`,
                    opacity: i === 2 ? 1 : 0.55,
                  }}
                >
                  <div className="mb-3 h-3 w-20 rounded-full bg-brand-100" />
                  <div className="mb-2 h-2.5 w-full rounded-full bg-stone-100" />
                  <div className="mb-2 h-2.5 w-5/6 rounded-full bg-stone-100" />
                  <div className="h-2.5 w-2/3 rounded-full bg-brand-50" />
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal dir="right" delay={140}>
            <div>
              <h2 id="stories-teaser" className="text-3xl font-extrabold text-stone-900">
                🤝 {t.home.storiesTeaserTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">{t.home.storiesTeaserBody}</p>
              <Link href="/stories" className="btn-primary mt-7">{t.nav.stories}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== FINAL CTA ========================== */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-brand-800 via-brand-700 to-sky-700 px-6 py-16 text-center text-white sm:px-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute start-1/4 -top-16 h-56 w-56 animate-drift rounded-full bg-cyan-300/50 blur-3xl" />
              <div className="absolute bottom-[-4rem] end-1/4 h-56 w-56 animate-drift-alt rounded-full bg-brand-300/40 blur-3xl" />
            </div>
            <h2 className="relative mx-auto max-w-xl text-3xl font-extrabold leading-snug sm:text-4xl">
              {t.home.heroTitle}
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-brand-100">{t.home.heroSubtitle}</p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="btn-primary shine animate-pulse-ring !bg-white !px-8 !py-4 !text-base !text-brand-900">
                {t.pricing.ctaStart}
              </Link>
              <Link href="/pricing" className="btn-secondary !border-white/40 !bg-transparent !px-7 !py-4 !text-base !text-white hover:!bg-white/10">
                {t.home.pricingCta}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
