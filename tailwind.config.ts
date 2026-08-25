import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effaf7",
          100: "#d7f2ea",
          200: "#b0e5d6",
          300: "#7dd1bd",
          400: "#49b5a0",
          500: "#279a87",
          600: "#177c6e",
          700: "#136459",
          800: "#115049",
          900: "#0f433d",
          950: "#052724",
        },
        sand: {
          50: "#faf9f6",
          100: "#f3f1ea",
          200: "#e6e2d3",
        },
      },
      fontFamily: {
        sans: [
          "'Noto Sans Arabic'",
          "'Tajawal'",
          "'Segoe UI'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 67, 61, 0.08), 0 4px 14px rgba(15, 67, 61, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
