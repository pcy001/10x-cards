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
// Sprawdź czy jesteśmy w środowisku Cloudflare
// WAŻNE: Używamy process.env, ponieważ import.meta.env jest dostępne tylko w czasie działania aplikacji,
// a nie podczas budowania. CF_PAGES to zmienna środowiskowa ustawiana w CI/CD
const CF_PAGES = process.env.CF_PAGES === "1";
console.log(`Building with CF_PAGES=${CF_PAGES}`);

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
    define: {
      // Dodaj zmienne środowiskowe do klienta
      "import.meta.env.CF_PAGES": JSON.stringify(CF_PAGES),
    },
  },
  // Wybieramy adapter w zależności od środowiska budowania
  adapter: CF_PAGES ? cloudflare() : node({ mode: "standalone" }),
});
