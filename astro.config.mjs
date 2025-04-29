// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
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
  // Wybieramy adapter w zależności od środowiska
  adapter:
    process.env.CF_PAGES === "1"
      ? cloudflare({
          mode: "advanced", // Wspiera middleware
          runtime: {
            mode: "local",
            persistTo: "./.cloudflare/state", // Dla lokalnego stanu
          },
        })
      : node({
          mode: "standalone",
        }),
});
