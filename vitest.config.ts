import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    test: {
      environment: "node",
      globals: true,
      env: {
        DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY || "",
        DEEPSEEK_BASE_URL: env.DEEPSEEK_BASE_URL || "",
        DEEPSEEK_MODEL: env.DEEPSEEK_MODEL || ""
      }
    },
    esbuild: {
      jsx: "automatic"
    },
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname
      }
    }
  };
});
