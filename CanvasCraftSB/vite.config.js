import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import packageJson from "./package.json" with { type: "json" };

function appVersionPlugin() {
  return {
    name: "app-version",
    transformIndexHtml(html) {
      return html.replaceAll("__APP_VERSION__", packageJson.version);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), appVersionPlugin()],
});
