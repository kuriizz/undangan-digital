import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthMessage } from "@/features/auth/message";
import { requireUser } from "@/features/auth/session";
import { storedInvitationDraftV2Schema } from "@/features/invitations/content";
import { InvitationForm } from "@/features/invitations/invitation-form";
import type { InvitationDraftValues } from "@/features/invitations/schemas";
import {
  MediaManager,
  type InvitationMediaItem,
} from "@/features/media/media-manager";

function localEventParts(timestamp: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

export default async function InvitationContentPage({
  params,
  searchParams,
}: PageProps<"/dashboard/invitations/[id]/content">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { supabase } = await requireUser();
  const [{ data: invitation }, { data: events }, { data: media }] =
    await Promise.all([
      supabase
        .from("invitations")
        .select("id, slug, draft_content, draft_revision, status")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("invitation_events")
        .select(
          "event_name, starts_at, timezone, venue_name, address, map_url, sort_order",
        )
        .eq("invitation_id", id)
        .order("sort_order"),
      supabase
        .from("invitation_media")
        .select("id, kind, storage_path, alt_text, sort_order")
        .eq("invitation_id", id)
        .order("sort_order"),
    ]);

  const content = storedInvitationDraftV2Schema.safeParse(
    invitation?.draft_content,
  );
  if (!invitation || !events?.length || !content.success) notFound();

  const initialEvents = events.map((event) => {
    const localEvent = localEventParts(event.starts_at, event.timezone);
    return {
      name: event.event_name,
      date: localEvent.date,
      time: localEvent.time,
      timezone: event.timezone,
      venueName: event.venue_name,
      address: event.address,
      mapUrl: event.map_url ?? "",
    };
  });
  const initialValues: InvitationDraftValues = {
    invitationId: invitation.id,
    slug: invitation.slug,
    partnerOneName: content.data.couple.partnerOneName,
    partnerTwoName: content.data.couple.partnerTwoName,
    story: content.data.content.story,
    giftBankName: content.data.content.giftBankName,
    giftAccountNumber: content.data.content.giftAccountNumber,
    giftAccountHolder: content.data.content.giftAccountHolder,
    closingMessage: content.data.content.closingMessage,
    contactName: content.data.content.contactName,
    contactPhone: content.data.content.contactPhone,
    eventsJson: JSON.stringify(initialEvents),
    sectionsJson: JSON.stringify(content.data.presentation.sections),
    templateKey: content.data.presentation.templateKey,
    accent: content.data.presentation.accent,
    typography: content.data.presentation.typography,
  };
  const initialMedia: InvitationMediaItem[] = (media ?? []).map((item) => ({
    id: item.id,
    kind: item.kind as "cover" | "gallery",
    path: item.storage_path,
    altText: item.alt_text,
    sortOrder: item.sort_order,
  }));

  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10">
      <section className="mx-auto w-full max-w-4xl space-y-7 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
        <header>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-rose-800 hover:underline"
          >
            ← Kembali ke dashboard
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
                Editor undangan
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                {content.data.couple.partnerOneName} &amp;{" "}
                {content.data.couple.partnerTwoName}
              </h1>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
              Draft revisi {invitation.draft_revision}
            </span>
          </div>
          <p className="mt-3 leading-7 text-stone-600">
            Simpan perubahan tanpa memengaruhi halaman publik, lalu periksa
            hasilnya di mode preview sebelum menerbitkan ulang.
          </p>
        </header>

        <AuthMessage success={query.success} />
        <Link
          href={`/dashboard/invitations/${invitation.id}/preview`}
          className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-rose-50 px-5 font-semibold text-rose-900 hover:bg-rose-100"
        >
          Lihat preview
        </Link>
        <MediaManager invitationId={invitation.id} media={initialMedia} />
        <InvitationForm mode="edit" initialValues={initialValues} />
      </section>
    </main>
  );
}
