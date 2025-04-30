// Ładujemy polyfille przed uruchomieniem aplikacji
import './polyfills/message-channel.js';

// Re-eksportujemy domyślny plik handlera Astro
export * from '../dist/_worker.js'; 