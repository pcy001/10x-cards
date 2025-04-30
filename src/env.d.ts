/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
    }
  }
}

// Zastosowanie astro:env do deklaracji zmiennych środowiskowych
type EnvSchema = {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  
  // OpenRouter
  OPENROUTER_API_KEY: string;
  
  // Inne zmienne środowiskowe
  // ...
}

type RuntimeEnv = "development" | "production" | "test";

// Dostarcza typowanie dla importu z 'astro:env'
declare module 'astro:env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_KEY: string;
  export const PUBLIC_SUPABASE_URL: string;
  export const PUBLIC_SUPABASE_ANON_KEY: string;
  export const OPENROUTER_API_KEY: string;
}

// Deklaracje dla Cloudflare
interface MessageChannel {
  port1: MessagePort;
  port2: MessagePort;
}

interface MessagePort {
  postMessage(message: any): void;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
  start(): void;
  close(): void;
}

// Dodajemy deklaracje dla globalnych obiektów
declare global {
  interface Window {
    MessageChannel: typeof MessageChannel;
    MessagePort: typeof MessagePort;
  }

  // Globalne definicje dla środowiska Node
  const MessageChannel: typeof MessageChannel;
  const MessagePort: typeof MessagePort;
}
