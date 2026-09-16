import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0B0C0F",
        panel: "#141519",
        panel2: "#1B1D22",
        line: "rgba(255,255,255,0.08)",
        lineStrong: "rgba(255,255,255,0.14)",
        ink: "#F2F3F5",
        inkDim: "#9AA0AC",
        accent: "#6C8CFF",
        accentStrong: "#8AA4FF",
        good: "#3DD68C",
        warn: "#F5B84E",
        bad: "#F0616D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "10px",
        xl: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
