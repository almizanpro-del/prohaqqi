"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Dir = "up" | "left" | "right";

/** Scroll-triggered entrance animation (IntersectionObserver). */
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${dir === "left" ? "reveal-left" : dir === "right" ? "reveal-right" : ""} ${
        visible ? "is-visible" : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
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
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
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
