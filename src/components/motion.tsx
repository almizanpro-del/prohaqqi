"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const useIsoEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Dir = "up" | "left" | "right";

/**
 * Scroll-triggered entrance — bulletproof:
 *  1. Server-rendered content is VISIBLE (no-JS can never hide content).
 *  2. JS arms the hidden state pre-paint, then IntersectionObserver reveals.
 *  3. A 2.5s failsafe forces visibility even if IO never fires.
 */
export function Reveal({
  children,
  delay = 0,
  dir = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  dir?: Dir;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("reveal-armed");
    if (delay > 0) el.style.transitionDelay = `${delay}ms`;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      el.classList.add("is-visible");
      io?.disconnect();
      clearTimeout(failsafe);
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => entry.isIntersecting && show(),
            { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
          )
        : null;

    io?.observe(el);
    const failsafe = window.setTimeout(show, 2500);

    return () => {
      io?.disconnect();
      clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${dir === "left" ? "reveal-left" : dir === "right" ? "reveal-right" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** Animated number counter that starts when scrolled into view. */
export function CountUp({
  to,
  duration = 1700,
  locale = "ar-JO",
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && run(), {
      threshold: 0.5,
    });
    io.observe(el);
    // failsafe: if IO misses (e.g. full-page capture), run shortly after mount
    const t = window.setTimeout(run, 3000);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [to, duration]);

  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-US").format(val);
  } catch {
    formatted = String(val);
  }

  return (
    <span ref={ref} className={className} dir="ltr">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
