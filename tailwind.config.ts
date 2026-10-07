import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          panel: "var(--panel)",
          "panel-strong": "var(--panel-strong)",
          paper: "var(--paper)",
          "paper-strong": "var(--paper-strong)",
          muted: "var(--muted)",
          border: "var(--border)",
          accent: "var(--accent)",
          danger: {
            DEFAULT: "var(--danger)",
            foreground: "var(--danger-foreground)",
            surface: "var(--danger-surface)",
            border: "var(--danger-border)"
          },
          success: {
            DEFAULT: "var(--success)",
            surface: "var(--success-surface)",
            border: "var(--success-border)"
          },
          warning: {
            DEFAULT: "var(--warning)",
            surface: "var(--warning-surface)",
            border: "var(--warning-border)"
          },
          info: {
            DEFAULT: "var(--info)",
            surface: "var(--info-surface)",
            border: "var(--info-border)"
          }
        },
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
      },
      spacing: {
        "8.5": "2.125rem",
        "9.5": "2.375rem"
      }
    }
  },
  plugins: []
};

export default config;
