import { defineConfig } from 'vite';

export default defineConfig({
  // Konfiguracja Vite
  build: {
    rollupOptions: {
      // Podczas budowania aplikacji, dodajemy nasze polyfille jako pierwsze
      input: {
        polyfills: './src/polyfills.js',
      }
    }
  },
  // Definicje globalne  
  define: {
    // Zapewniamy, że MessageChannel jest dostępny
    'typeof MessageChannel': '"function"',
  }
}); 