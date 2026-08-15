import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(
      "/login?error=Sesi%20Anda%20telah%20berakhir.%20Silakan%20masuk%20kembali.",
    );
  }

  return { supabase, user };
}
