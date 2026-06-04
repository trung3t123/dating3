import {
  createSupabaseBrowserClient,
  type EventSubmissionRow,
} from "./supabase/client";

export type EventConfig = {
  date: string;
  viewingMode: "cinema";
  savedAt: string;
};

export const EVENT_CONFIG_KEY = "him.exe.event-config";

export async function submitEventConfig(config: {
  date: string;
  viewingMode: "cinema";
}): Promise<{ ok: true; payload: EventConfig } | { ok: false; error: string }> {
  const payload: EventConfig = {
    ...config,
    savedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      error:
        "Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  const row: EventSubmissionRow = {
    event_date: config.date,
    viewing_mode: config.viewingMode,
  };

  const { error } = await supabase.from("event_submissions").insert(row);

  if (error) {
    console.error("[submitEventConfig]", error);
    return { ok: false, error: error.message };
  }

  try {
    localStorage.setItem(EVENT_CONFIG_KEY, JSON.stringify(payload));
  } catch {
    /* localStorage unavailable */
  }

  return { ok: true, payload };
}
