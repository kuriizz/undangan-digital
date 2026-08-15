import { cache } from "react";

import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

import { invitationDocumentV1Schema } from "./content";

export const getOwnedInvitationPreview = cache(async (invitationId: string) => {
  const { supabase } = await requireUser();
  const [{ data: invitation }, { data: event }] = await Promise.all([
    supabase
      .from("invitations")
      .select(
        "id, slug, status, draft_content, draft_revision, published_revision, published_at",
      )
      .eq("id", invitationId)
      .maybeSingle(),
    supabase
      .from("invitation_events")
      .select("event_name, starts_at, timezone, venue_name, address, map_url")
      .eq("invitation_id", invitationId)
      .eq("sort_order", 0)
      .maybeSingle(),
  ]);

  if (!invitation || !event) return null;

  const document = invitationDocumentV1Schema.safeParse({
    ...invitation.draft_content,
    event: {
      name: event.event_name,
      startsAt: event.starts_at,
      timezone: event.timezone,
      venueName: event.venue_name,
      address: event.address,
      mapUrl: event.map_url,
    },
  });

  if (!document.success) return null;

  return {
    id: invitation.id,
    slug: invitation.slug,
    status: invitation.status,
    draftRevision: invitation.draft_revision,
    publishedRevision: invitation.published_revision,
    publishedAt: invitation.published_at,
    document: document.data,
  };
});

export const getPublishedInvitationBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_invitation", {
    p_slug: slug,
  });
  const invitation = Array.isArray(data) ? data[0] : null;

  if (error || !invitation) return null;

  const document = invitationDocumentV1Schema.safeParse(
    invitation.published_content,
  );
  if (!document.success) return null;

  return {
    slug: invitation.slug as string,
    publishedAt: invitation.published_at as string,
    document: document.data,
  };
});
