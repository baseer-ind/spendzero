import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Single Supabase client for SELFly. Reads ONLY the client-safe publishable key
 * (never the service-role key). If env is absent (e.g. a local build without
 * secrets), `supabase` is null and the app runs in local-only mode — the
 * existing device-local experience still works.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const cloudEnabled = supabase != null;
export const MEDIA_BUCKET = "user-media";
