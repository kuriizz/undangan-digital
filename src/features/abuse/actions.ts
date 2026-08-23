"use server";

import { createRequestFingerprint } from "@/lib/security/request-fingerprint";
import { reportOperationalError } from "@/lib/observability/report-error";
import { createTrustedServerClient } from "@/lib/supabase/trusted-server";

import { abuseReportSchema, type AbuseReportValues } from "./schemas";

export type AbuseReportState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<keyof AbuseReportValues, string[]>>;
  values?: AbuseReportValues;
};

function formValues(formData: FormData): AbuseReportValues {
  const value = (name: keyof AbuseReportValues) => {
    const item = formData.get(name);
    return typeof item === "string" ? item : "";
  };
  return {
    slug: value("slug"),
    category: value("category") as AbuseReportValues["category"],
    details: value("details"),
    contactEmail: value("contactEmail"),
    website: value("website") as "",
    idempotencyKey: value("idempotencyKey"),
  };
}

export async function submitAbuseReport(
  _state: AbuseReportState,
  formData: FormData,
): Promise<AbuseReportState> {
  const values = formValues(formData);
  const parsed = abuseReportSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali laporan yang ditandai.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  const fingerprint = await createRequestFingerprint();
  if (!fingerprint) {
    return {
      status: "error",
      message: "Layanan laporan belum tersedia.",
      values,
    };
  }

  const supabase = createTrustedServerClient();
  const { data, error } = await supabase.rpc("submit_abuse_report", {
    p_slug: parsed.data.slug,
    p_category: parsed.data.category,
    p_details: parsed.data.details,
    p_contact_email: parsed.data.contactEmail,
    p_fingerprint_hash: fingerprint,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  const response = Array.isArray(data) ? data[0] : null;
  if (error || !response) {
    reportOperationalError("abuse-report-submit-failed", error, {
      hasResponse: Boolean(response),
    });
    return { status: "error", message: "Laporan belum dapat dikirim.", values };
  }
  if (response.result === "rate_limited") {
    return {
      status: "error",
      message: "Terlalu banyak laporan. Silakan coba kembali dalam satu jam.",
      values,
    };
  }
  if (response.result === "unavailable") {
    return {
      status: "error",
      message: "Undangan tidak ditemukan atau sudah tidak diterbitkan.",
      values,
    };
  }
  return {
    status: "success",
    message: "Laporan diterima dan akan ditinjau oleh pengelola.",
  };
}
