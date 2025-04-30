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

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
