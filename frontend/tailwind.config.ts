import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#07080A", 900: "#0B0C0F", 800: "#101216", 700: "#171A20", 600: "#20242C", 500: "#2C313B" },
        bone: { DEFAULT: "#F4F1EA", dim: "#B9B5AC", mute: "#7E838E" },
        molten: { DEFAULT: "#FF5A1F", 400: "#FF7A45", 600: "#E2440C" },
        amber: { DEFAULT: "#FFB020" },
        volt: { DEFAULT: "#C6FF3D" },
        sky: { DEFAULT: "#38BDF8" },
        rose: { DEFAULT: "#F43F5E" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        pulseRing: { "0%": { transform: "scale(.8)", opacity: "0.8" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
        scanline: { "0%": { top: "6%" }, "50%": { top: "90%" }, "100%": { top: "6%" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        pulseRing: "pulseRing 1.8s cubic-bezier(.2,.6,.4,1) infinite",
        scanline: "scanline 2.6s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
