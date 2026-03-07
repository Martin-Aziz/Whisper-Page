import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      // Coverage measured only against the testable business logic layer.
      // React components and Tauri-dependent hooks are covered by E2E Playwright tests.
      include: [
        "src/store/**/*.ts",
        "src/services/**/*.ts",
        "src/utils/**/*.ts",
      ],
      exclude: [
        "node_modules/**",
        "src-tauri/**",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 80,
        branches: 80,
        statements: 70,
      },
    },
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
  },
});
