"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { pathWithMessage, safeRedirectPath } from "./navigation";
import {
  emailSchema,
  firstValidationMessage,
  profileSchema,
  registerSchema,
  signInSchema,
  updatePasswordSchema,
} from "./schemas";
import { requireUser } from "./session";

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function requestOrigin() {
  const requestHeaders = await headers();
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get("origin") ??
    "http://localhost:3000"
  );
}

export async function signIn(formData: FormData) {
  const next = safeRedirectPath(formData.get("next"));
  const result = signInSchema.safeParse({
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
  });

  if (!result.success) {
    redirect(
      pathWithMessage(
        `/login?next=${encodeURIComponent(next)}`,
        "error",
        firstValidationMessage(result.error),
      ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    redirect(
      pathWithMessage(
        `/login?next=${encodeURIComponent(next)}`,
        "error",
        "Email atau kata sandi tidak sesuai.",
      ),
    );
  }

  redirect(next);
}

export async function register(formData: FormData) {
  const result = registerSchema.safeParse({
    displayName: stringValue(formData, "displayName"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    passwordConfirmation: stringValue(formData, "passwordConfirmation"),
  });

  if (!result.success) {
    redirect(
      pathWithMessage(
        "/register",
        "error",
        firstValidationMessage(result.error),
      ),
    );
  }

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: { display_name: result.data.displayName },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    redirect(
      pathWithMessage(
        "/register",
        "error",
        "Pendaftaran belum berhasil. Periksa data atau coba beberapa saat lagi.",
      ),
    );
  }

  if (!data.session) {
    redirect(
      pathWithMessage(
        "/login",
        "success",
        "Periksa email Anda untuk mengaktifkan akun sebelum masuk.",
      ),
    );
  }

  redirect("/onboarding");
}

export async function requestPasswordReset(formData: FormData) {
  const result = emailSchema.safeParse({
    email: stringValue(formData, "email"),
  });

  if (!result.success) {
    redirect(
      pathWithMessage(
        "/forgot-password",
        "error",
        firstValidationMessage(result.error),
      ),
    );
  }

  const supabase = await createClient();
  const origin = await requestOrigin();

  await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  redirect(
    pathWithMessage(
      "/forgot-password",
      "success",
      "Jika akun terdaftar, tautan reset kata sandi telah dikirim.",
    ),
  );
}

export async function updatePassword(formData: FormData) {
  const result = updatePasswordSchema.safeParse({
    password: stringValue(formData, "password"),
    passwordConfirmation: stringValue(formData, "passwordConfirmation"),
  });

  if (!result.success) {
    redirect(
      pathWithMessage(
        "/update-password",
        "error",
        firstValidationMessage(result.error),
      ),
    );
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    redirect(
      pathWithMessage(
        "/update-password",
        "error",
        "Kata sandi belum dapat diperbarui. Silakan coba lagi.",
      ),
    );
  }

  redirect(
    pathWithMessage("/dashboard", "success", "Kata sandi berhasil diperbarui."),
  );
}

export async function updateProfile(formData: FormData) {
  const result = profileSchema.safeParse({
    displayName: stringValue(formData, "displayName"),
  });

  if (!result.success) {
    redirect(
      pathWithMessage(
        "/onboarding",
        "error",
        firstValidationMessage(result.error),
      ),
    );
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: result.data.displayName })
    .eq("id", user.id);

  if (error) {
    redirect(
      pathWithMessage(
        "/onboarding",
        "error",
        "Profil belum dapat disimpan. Silakan coba lagi.",
      ),
    );
  }

  redirect(
    pathWithMessage("/dashboard", "success", "Profil berhasil disimpan."),
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(pathWithMessage("/login", "success", "Anda telah keluar."));
}
