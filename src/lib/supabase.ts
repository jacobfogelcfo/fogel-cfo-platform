import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Surfaced loudly in dev — silent failure here would cascade into 100 confusing query errors.
  // eslint-disable-next-line no-console
  console.error(
    "[fogelcfo] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Set them in `.env` (see `.env.example`) and restart the dev server.",
  );
}

export const supabase = createClient(url ?? "http://localhost:54321", anonKey ?? "anon-key-missing", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(url && anonKey);
