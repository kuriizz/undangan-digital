import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnvironment } from "./environment";

export function createClient() {
  const { publishableKey, url } = getSupabaseEnvironment();

  return createBrowserClient(url, publishableKey);
}
