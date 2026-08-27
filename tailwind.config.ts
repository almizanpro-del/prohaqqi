import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Blue-teal identity (no green hues) */
        brand: {
          50: "#f0f9fb",
          100: "#d9f1f6",
          200: "#b5e3ee",
          300: "#83cede",
          400: "#4cb2da",
          500: "#2b95c2",
          600: "#1f78a4",
          700: "#1e6185",
          800: "#1e516d",
          900: "#1d445b",
          950: "#0c2b40",
        },
        sand: {
          50: "#f8fbfc",
          100: "#eef4f7",
          200: "#dfeaf0",
        },
        /* Neutral system — used for refined type & surface contrast */
        ink: {
          50: "#f7f8fa",
          100: "#eef0f3",
          200: "#dde1e7",
          300: "#c2c8d2",
          400: "#8d95a3",
          500: "#5f6878",
          600: "#454d5b",
          700: "#333a47",
          800: "#1f2531",
          900: "#0f131c",
        },
      },
      fontFamily: {
        sans: ["'Cairo'", "'Tajawal'", "'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Tajawal'", "'Cairo'", "'Segoe UI'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        prose: "62ch",
      },
      boxShadow: {
        card: "0 1px 3px rgba(12,43,64,0.08), 0 4px 14px rgba(12,43,64,0.06)",
        glow: "0 0 0 1px rgba(76,178,218,.35), 0 8px 40px rgba(43,149,194,.35)",
        float: "0 18px 50px rgba(12,43,64,.16)",
        /* Premium stack — used by landing only */
        "soft-sm": "0 1px 2px rgba(15,19,28,0.04), 0 2px 6px rgba(15,19,28,0.05)",
        soft: "0 1px 2px rgba(15,19,28,0.05), 0 6px 24px -8px rgba(15,19,28,0.10)",
        "soft-lg": "0 2px 4px rgba(15,19,28,0.04), 0 24px 60px -20px rgba(15,19,28,0.18)",
        ring: "0 0 0 1px rgba(15,19,28,0.06)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-10px) rotate(1deg)" },
        },
        drift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-16px) scale(1.05)" },
          "66%": { transform: "translate(-16px,12px) scale(0.97)" },
        },
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        "word-rise": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(43,149,194,.35)" },
          "70%": { boxShadow: "0 0 0 10px rgba(43,149,194,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(43,149,194,0)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "bounce-soft": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
        "line-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "hero-aurora": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%,-1%,0) scale(1.04)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        drift: "drift 28s ease-in-out infinite",
        "drift-alt": "drift 34s ease-in-out infinite reverse",
        marquee: "marquee 30s linear infinite",
        "word-rise": "word-rise .7s cubic-bezier(.2,.65,.25,1) both",
        "fade-up": "fade-up .8s ease-out both",
        shimmer: "shimmer 2.6s linear infinite",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(.4,0,.6,1) infinite",
        wiggle: "wiggle .8s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2.2s ease-in-out infinite",
        "line-grow": "line-grow 1.4s ease-out .3s both",
        "pop-in": "pop-in .5s ease-out both",
        "hero-aurora": "hero-aurora 18s ease-in-out infinite",
        "fade-in": "fade-in .9s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
