import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { canvas: "#060910", ink: "#f2f6ff", accent: "#ff5548" },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'Inter'",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: { tightest: "-0.04em" },
    },
  },
  plugins: [],
};

export default config;
