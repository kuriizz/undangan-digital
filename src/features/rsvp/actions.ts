"use server";

import { createRequestFingerprint } from "@/lib/security/request-fingerprint";
import { reportOperationalError } from "@/lib/observability/report-error";
import { createTrustedServerClient } from "@/lib/supabase/trusted-server";

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
    wish: value("wish"),
    guestToken: value("guestToken"),
    website: value("website"),
    idempotencyKey: value("idempotencyKey"),
  };
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

  const fingerprint = await createRequestFingerprint();
  if (!fingerprint) {
    return {
      status: "error",
      message: "Layanan RSVP belum dikonfigurasi. Silakan coba lagi nanti.",
      values,
    };
  }

  const supabase = createTrustedServerClient();
  const { data, error } = await supabase.rpc("submit_public_rsvp", {
    p_slug: result.data.slug,
    p_name: result.data.name,
    p_attendance: result.data.attendance,
    p_party_size: result.data.partySize,
    p_note: result.data.note,
    p_wish: result.data.wish,
    p_guest_token: result.data.guestToken,
    p_idempotency_key: result.data.idempotencyKey,
    p_fingerprint_hash: fingerprint,
  });
  const response = Array.isArray(data) ? data[0] : null;

  if (error || !response) {
    reportOperationalError("public-rsvp-submit-failed", error, {
      hasResponse: Boolean(response),
    });
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

  if (response.result === "party_limit_exceeded") {
    return {
      status: "error",
      message: "Jumlah hadir melebihi batas rombongan pada undangan personal.",
      values,
    };
  }

  return {
    status: "success",
    message: "Terima kasih. RSVP Anda berhasil dikirim.",
    values,
  };
}
