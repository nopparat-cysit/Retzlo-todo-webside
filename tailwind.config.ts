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
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(169, 162, 255, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
