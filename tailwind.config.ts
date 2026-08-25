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
      },
      fontFamily: {
        sans: ["'Cairo'", "'Tajawal'", "'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(12,43,64,0.08), 0 4px 14px rgba(12,43,64,0.06)",
        glow: "0 0 0 1px rgba(76,178,218,.35), 0 8px 40px rgba(43,149,194,.35)",
        float: "0 18px 50px rgba(12,43,64,.16)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-22px) rotate(2deg)" },
        },
        drift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.15)" },
          "66%": { transform: "translate(-30px,20px) scale(0.92)" },
        },
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        "word-rise": {
          from: { opacity: "0", transform: "translateY(28px) rotateX(40deg)" },
          to: { opacity: "1", transform: "translateY(0) rotateX(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(43,149,194,.45)" },
          "70%": { boxShadow: "0 0 0 16px rgba(43,149,194,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(43,149,194,0)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "bounce-soft": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "line-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(.85)" },
          "70%": { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite",
        "drift-alt": "drift 28s ease-in-out infinite reverse",
        marquee: "marquee 30s linear infinite",
        "word-rise": "word-rise .7s cubic-bezier(.2,.65,.25,1.2) both",
        "fade-up": "fade-up .8s ease-out both",
        shimmer: "shimmer 2.6s linear infinite",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(.4,0,.6,1) infinite",
        wiggle: "wiggle .6s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1.6s ease-in-out infinite",
        "line-grow": "line-grow 1.4s ease-out .3s both",
        "pop-in": "pop-in .6s cubic-bezier(.2,.65,.25,1.2) both",
      },
    },
  },
  plugins: [],
};

export default config;
