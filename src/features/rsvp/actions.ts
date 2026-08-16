"use server";

import { createHmac } from "node:crypto";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { publicRsvpSchema, type PublicRsvpValues } from "./schemas";

export type PublicRsvpFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<keyof PublicRsvpValues, string[]>>;
  values?: PublicRsvpValues;
};

function valuesFrom(formData: FormData): PublicRsvpValues {
  const value = (name: keyof PublicRsvpValues) => {
    const candidate = formData.get(name);
    return typeof candidate === "string" ? candidate : "";
  };

  return {
    slug: value("slug"),
    name: value("name"),
    attendance: value("attendance"),
    partySize: value("partySize"),
    note: value("note"),
    idempotencyKey: value("idempotencyKey"),
  };
}

async function requestFingerprint() {
  const secret = process.env.RSVP_FINGERPRINT_SECRET;
  if (!secret) return null;

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0];
  const address = forwardedFor?.trim() || "unknown-address";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown-agent";
  const language = requestHeaders.get("accept-language") ?? "unknown-language";

  return createHmac("sha256", secret)
    .update(`${address}\n${userAgent}\n${language}`)
    .digest("hex");
}

export async function submitPublicRsvp(
  _previousState: PublicRsvpFormState,
  formData: FormData,
): Promise<PublicRsvpFormState> {
  const values = valuesFrom(formData);
  const result = publicRsvpSchema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: "Periksa kembali data RSVP yang ditandai.",
      fieldErrors: result.error.flatten().fieldErrors,
      values,
    };
  }

  const fingerprint = await requestFingerprint();
  if (!fingerprint) {
    return {
      status: "error",
      message: "Layanan RSVP belum dikonfigurasi. Silakan coba lagi nanti.",
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_public_rsvp", {
    p_slug: result.data.slug,
    p_name: result.data.name,
    p_attendance: result.data.attendance,
    p_party_size: result.data.partySize,
    p_note: result.data.note,
    p_idempotency_key: result.data.idempotencyKey,
    p_fingerprint_hash: fingerprint,
  });
  const response = Array.isArray(data) ? data[0] : null;

  if (error || !response) {
    return {
      status: "error",
      message: "RSVP belum dapat dikirim. Silakan coba lagi.",
      values,
    };
  }

  if (response.result === "rate_limited") {
    return {
      status: "error",
      message: "Terlalu banyak percobaan. Silakan tunggu 10 menit.",
      values,
    };
  }

  if (response.result === "unavailable") {
    return {
      status: "error",
      message: "Undangan tidak sedang menerima RSVP.",
      values,
    };
  }

  return {
    status: "success",
    message: "Terima kasih. RSVP Anda berhasil dikirim.",
    values,
  };
}
