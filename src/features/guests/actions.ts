"use server";

import { createHash, randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/session";

import { guestIdSchema, guestInputSchema } from "./schemas";

export type GuestLinkState = {
  status: "idle" | "error" | "success";
  message?: string;
  shareUrl?: string;
  whatsappUrl?: string;
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function shareDetails(slug: string, name: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const shareUrl = `${siteUrl}/i/${slug}?to=${encodeURIComponent(token)}`;
  return {
    shareUrl,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`Halo ${name}, kami mengundang Anda ke hari bahagia kami. Buka undangan personal: ${shareUrl}`)}`,
  };
}

export async function createGuest(
  _state: GuestLinkState,
  formData: FormData,
): Promise<GuestLinkState> {
  const parsed = guestInputSchema.safeParse({
    invitationId: formData.get("invitationId"),
    name: formData.get("name"),
    partyLimit: formData.get("partyLimit"),
  });
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message };

  const { supabase, user } = await requireUser();
  const token = randomBytes(32).toString("base64url");
  const { data: invitation } = await supabase
    .from("invitations")
    .select("slug")
    .eq("id", parsed.data.invitationId)
    .maybeSingle();
  if (!invitation)
    return { status: "error", message: "Undangan tidak ditemukan." };

  const { error } = await supabase.from("guests").insert({
    invitation_id: parsed.data.invitationId,
    owner_id: user.id,
    name: parsed.data.name,
    party_limit: parsed.data.partyLimit,
    token_hash: hashToken(token),
  });
  if (error)
    return { status: "error", message: "Tamu belum dapat ditambahkan." };

  revalidatePath(`/dashboard/invitations/${parsed.data.invitationId}/guests`);
  return {
    status: "success",
    message:
      "Tamu berhasil ditambahkan. Salin tautan sebelum meninggalkan halaman.",
    ...shareDetails(invitation.slug, parsed.data.name, token),
  };
}

export async function rotateGuestLink(
  _state: GuestLinkState,
  formData: FormData,
): Promise<GuestLinkState> {
  const parsed = guestIdSchema.safeParse({
    invitationId: formData.get("invitationId"),
    guestId: formData.get("guestId"),
  });
  if (!parsed.success) return { status: "error", message: "Tamu tidak valid." };
  const { supabase } = await requireUser();
  const token = randomBytes(32).toString("base64url");
  const { data, error } = await supabase
    .from("guests")
    .update({ token_hash: hashToken(token) })
    .eq("id", parsed.data.guestId)
    .eq("invitation_id", parsed.data.invitationId)
    .select("name, invitations!inner(slug)")
    .maybeSingle();
  if (error || !data)
    return { status: "error", message: "Tautan belum dapat dibuat." };
  const invitation = data.invitations as unknown as { slug: string };
  return {
    status: "success",
    message: "Tautan baru siap dibagikan. Tautan lama tidak berlaku.",
    ...shareDetails(invitation.slug, data.name, token),
  };
}

export async function updateGuest(formData: FormData) {
  const parsed = guestInputSchema.safeParse({
    invitationId: formData.get("invitationId"),
    guestId: formData.get("guestId"),
    name: formData.get("name"),
    partyLimit: formData.get("partyLimit"),
  });
  if (!parsed.success || !parsed.data.guestId) return;
  const { supabase } = await requireUser();
  await supabase
    .from("guests")
    .update({ name: parsed.data.name, party_limit: parsed.data.partyLimit })
    .eq("id", parsed.data.guestId)
    .eq("invitation_id", parsed.data.invitationId);
  revalidatePath(`/dashboard/invitations/${parsed.data.invitationId}/guests`);
}

export async function deleteGuest(formData: FormData) {
  const parsed = guestIdSchema.safeParse({
    invitationId: formData.get("invitationId"),
    guestId: formData.get("guestId"),
  });
  if (!parsed.success) return;
  const { supabase } = await requireUser();
  await supabase
    .from("guests")
    .delete()
    .eq("id", parsed.data.guestId)
    .eq("invitation_id", parsed.data.invitationId);
  revalidatePath(`/dashboard/invitations/${parsed.data.invitationId}/guests`);
}

export async function moderateWish(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const wishId = String(formData.get("wishId") ?? "");
  const intent = String(formData.get("intent") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(invitationId) ||
    !/^[0-9a-f-]{36}$/i.test(wishId)
  )
    return;
  const { supabase } = await requireUser();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("slug")
    .eq("id", invitationId)
    .maybeSingle();
  if (intent === "delete")
    await supabase
      .from("wishes")
      .delete()
      .eq("id", wishId)
      .eq("invitation_id", invitationId);
  else if (["approved", "hidden"].includes(intent))
    await supabase
      .from("wishes")
      .update({ status: intent })
      .eq("id", wishId)
      .eq("invitation_id", invitationId);
  revalidatePath(`/dashboard/invitations/${invitationId}/guests`);
  if (invitation) revalidatePath(`/i/${invitation.slug}`);
}
