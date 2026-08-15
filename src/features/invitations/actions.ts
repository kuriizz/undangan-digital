"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/session";

import {
  invitationDraftSchema,
  type InvitationDraftValues,
  toDraftContent,
  toEventTimestamp,
} from "./schemas";

export type InvitationDraftFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<keyof InvitationDraftValues, string[]>>;
  values?: InvitationDraftValues;
};

function formValues(formData: FormData): InvitationDraftValues {
  const value = (name: keyof InvitationDraftValues) => {
    const candidate = formData.get(name);
    return typeof candidate === "string" ? candidate : "";
  };

  return {
    invitationId: value("invitationId"),
    slug: value("slug"),
    partnerOneName: value("partnerOneName"),
    partnerTwoName: value("partnerTwoName"),
    eventName: value("eventName"),
    eventDate: value("eventDate"),
    eventTime: value("eventTime"),
    timezone: value("timezone"),
    venueName: value("venueName"),
    address: value("address"),
    mapUrl: value("mapUrl"),
  };
}

function databaseErrorMessage(code?: string) {
  if (code === "23505") {
    return "Slug tersebut sudah digunakan atau akun ini sudah memiliki undangan.";
  }

  if (code === "23514") {
    return "Data undangan tidak memenuhi aturan yang berlaku.";
  }

  return "Draft belum dapat disimpan. Silakan coba lagi.";
}

async function parseDraft(formData: FormData) {
  const values = formValues(formData);
  const result = invitationDraftSchema.safeParse(values);

  if (!result.success) {
    return {
      state: {
        status: "error" as const,
        message: "Periksa kembali data yang ditandai.",
        fieldErrors: result.error.flatten().fieldErrors,
        values,
      },
    };
  }

  return { input: result.data, values };
}

export async function createInvitationDraft(
  _previousState: InvitationDraftFormState,
  formData: FormData,
): Promise<InvitationDraftFormState> {
  const parsed = await parseDraft(formData);
  if (!parsed.input) return parsed.state;

  const { supabase } = await requireUser();
  const input = parsed.input;
  const { data, error } = await supabase.rpc("create_invitation_draft", {
    p_slug: input.slug,
    p_draft_content: toDraftContent(input),
    p_event_name: input.eventName,
    p_starts_at: toEventTimestamp(input),
    p_timezone: input.timezone,
    p_venue_name: input.venueName,
    p_address: input.address,
    p_map_url: input.mapUrl || null,
  });

  if (error || typeof data !== "string") {
    return {
      status: "error",
      message: databaseErrorMessage(error?.code),
      values: parsed.values,
    };
  }

  revalidatePath("/dashboard");
  redirect(
    `/dashboard/invitations/${data}/content?success=${encodeURIComponent("Draft undangan berhasil dibuat.")}`,
  );
}

export async function saveInvitationDraft(
  _previousState: InvitationDraftFormState,
  formData: FormData,
): Promise<InvitationDraftFormState> {
  const parsed = await parseDraft(formData);
  if (!parsed.input?.invitationId) {
    return (
      parsed.state ?? {
        status: "error",
        message: "Undangan tidak valid.",
        values: parsed.values,
      }
    );
  }

  const { supabase } = await requireUser();
  const input = parsed.input;
  const { error } = await supabase.rpc("save_invitation_draft", {
    p_invitation_id: input.invitationId,
    p_slug: input.slug,
    p_draft_content: toDraftContent(input),
    p_event_name: input.eventName,
    p_starts_at: toEventTimestamp(input),
    p_timezone: input.timezone,
    p_venue_name: input.venueName,
    p_address: input.address,
    p_map_url: input.mapUrl || null,
  });

  if (error) {
    return {
      status: "error",
      message: databaseErrorMessage(error.code),
      values: parsed.values,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/invitations/${input.invitationId}/content`);

  return {
    status: "success",
    message: "Perubahan draft berhasil disimpan.",
    values: { ...parsed.values, slug: input.slug },
  };
}
