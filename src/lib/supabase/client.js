import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)")
  }

  return createBrowserClient(url, anonKey)
}


