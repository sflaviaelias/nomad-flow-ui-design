// Configuração compartilhada pelo cliente e pelos endereços das Edge Functions.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, "");
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY em .env.local antes de iniciar o Go Nomad."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const AUTH_STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
export function clearLocalAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(`${AUTH_STORAGE_KEY}-code-verifier`);
  localStorage.removeItem("language");
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith("go-nomad:pending-trip:")) sessionStorage.removeItem(key);
  }
}
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storageKey: AUTH_STORAGE_KEY },
});
