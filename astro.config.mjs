// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
  experimental: {
    session: true,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ssr: {
      noExternal: ["react-router-dom", "@tanstack/react-query"],
    },
  },
  // Konfiguracja zmiennych środowiskowych
  env: {
    schema: {
      SUPABASE_URL: { context: "server", access: "secret", type: "string" },
      SUPABASE_KEY: { context: "server", access: "secret", type: "string" },
      OPENROUTER_API_KEY: { context: "server", access: "secret", type: "string" },
      PUBLIC_SUPABASE_URL: { context: "client", access: "public", type: "string" },
      PUBLIC_SUPABASE_ANON_KEY: { context: "client", access: "public", type: "string" },
    },
  },
});
