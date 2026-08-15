import { type NextRequest, NextResponse } from "next/server";

import { safeRedirectPath } from "@/features/auth/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=Tautan%20autentikasi%20tidak%20valid%20atau%20telah%20kedaluwarsa.",
      request.url,
    ),
  );
}
