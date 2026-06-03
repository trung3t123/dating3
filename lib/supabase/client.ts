import { createClient } from "@supabase/supabase-js";

export type EventSubmissionRow = {
  id?: string;
  event_date: string;
  viewing_mode: "cinema";
  created_at?: string;
};

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
