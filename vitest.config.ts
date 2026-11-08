import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom", include: ["src/**/*.test.{ts,tsx}", "supabase/functions/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks", poolOptions: { forks: { singleFork: true } },
    env: { VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "chave-publica-ficticia" },
  },
});
