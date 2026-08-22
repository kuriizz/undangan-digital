import { cache } from "react";

import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

import { createInvitationDocument, invitationDocumentSchema } from "./content";

export const getOwnedInvitationPreview = cache(async (invitationId: string) => {
  const { supabase } = await requireUser();
  const [{ data: invitation }, { data: events }, { data: media }] =
    await Promise.all([
      supabase
        .from("invitations")
        .select(
          "id, slug, status, draft_content, draft_revision, published_revision, published_at",
        )
        .eq("id", invitationId)
        .maybeSingle(),
      supabase
        .from("invitation_events")
        .select(
          "event_name, starts_at, timezone, venue_name, address, map_url, sort_order",
        )
        .eq("invitation_id", invitationId)
        .order("sort_order"),
      supabase
        .from("invitation_media")
        .select("id, kind, storage_path, alt_text, sort_order")
        .eq("invitation_id", invitationId)
        .order("sort_order"),
    ]);

  if (!invitation || !events?.length) return null;

  const document = createInvitationDocument(
    invitation.draft_content,
    events.map((event) => ({
      name: event.event_name,
      startsAt: event.starts_at,
      timezone: event.timezone,
      venueName: event.venue_name,
      address: event.address,
      mapUrl: event.map_url,
    })),
    (media ?? []).map((item) => ({
      id: item.id,
      kind: item.kind,
      path: item.storage_path,
      altText: item.alt_text,
      sortOrder: item.sort_order,
    })),
  );

  return {
    id: invitation.id,
    slug: invitation.slug,
    status: invitation.status,
    draftRevision: invitation.draft_revision,
    publishedRevision: invitation.published_revision,
    publishedAt: invitation.published_at,
    document,
  };
});

export const getPublishedInvitationBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_invitation", {
    p_slug: slug,
  });
  const invitation = Array.isArray(data) ? data[0] : null;

  if (error || !invitation) return null;

  const document = invitationDocumentSchema.safeParse(
    invitation.published_content,
  );
  if (!document.success) return null;

  return {
    slug: invitation.slug as string,
    publishedAt: invitation.published_at as string,
    document: document.data,
  };
});

export async function getPersonalizedGuest(slug: string, token?: string) {
  if (!token) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_personalized_guest", {
    p_slug: slug,
    p_token: token,
  });
  const guest = Array.isArray(data) ? data[0] : null;
  return guest
    ? {
        id: guest.guest_id as string,
        name: guest.guest_name as string,
        partyLimit: guest.party_limit as number,
      }
    : null;
}

export async function getPublicWishes(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_wishes", { p_slug: slug });
  return (data ?? []) as {
    name: string;
    message: string;
    created_at: string;
  }[];
}
