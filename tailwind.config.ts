import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080817",
          900: "#0e1025",
          800: "#161936",
          700: "#22264c"
        },
        dusk: {
          rose: "#d59ab3",
          amber: "#e5bd72",
          cyan: "#89c7d6",
          lavender: "#a9a2ff"
        },
        lofi: {
          paper: "#fff4e8",
          warm: "#f5efe6",
          glow: "#a9a2ff"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(169, 162, 255, 0.16)",
        lofi: "0 18px 54px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(245, 239, 230, 0.08)",
        panel: "0 8px 32px rgba(8, 8, 23, 0.4), inset 0 1px 0 rgba(245, 239, 230, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
