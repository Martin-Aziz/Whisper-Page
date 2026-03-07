import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

/**
 * Vite configuration for Lumina.
 * Tauri uses a fixed port and expects the dev server on localhost.
 */
export default defineConfig(() => {
  const serverConfig: UserConfig["server"] = {
    port: 1420,
    strictPort: true,
    host: host || false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  };

  if (host) {
    serverConfig.hmr = {
      protocol: "ws",
      host,
      port: 1421,
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    clearScreen: false,
    server: serverConfig,
  };
});
