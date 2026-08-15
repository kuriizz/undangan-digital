import { cache } from "react";

import { requireUser } from "@/features/auth/session";

import { invitationDocumentV1Schema } from "./content";

export const getOwnedInvitationPreview = cache(async (invitationId: string) => {
  const { supabase } = await requireUser();
  const [{ data: invitation }, { data: event }] = await Promise.all([
    supabase
      .from("invitations")
      .select("id, slug, draft_content, draft_revision")
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
    draftRevision: invitation.draft_revision,
    document: document.data,
  };
});
