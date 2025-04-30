import { initPolyfills } from '../polyfills.js';
import { defineMiddleware } from 'astro:middleware';

// Inicjalizacja polyfill
if (typeof globalThis !== 'undefined' && typeof globalThis.MessageChannel === 'undefined') {
  initPolyfills();
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Kontynuuj normalny przepływ żądania
  return await next();
}); 