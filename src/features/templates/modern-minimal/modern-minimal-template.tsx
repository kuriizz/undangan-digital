import Image from "next/image";
import type { ReactNode } from "react";

import type { InvitationDocument } from "@/features/invitations/content";
import { getInvitationMediaPublicUrl } from "@/features/media/public-url";

type ModernMinimalTemplateProps = {
  afterSections?: ReactNode;
  document: InvitationDocument;
  mediaUrl?: (media: InvitationDocument["media"][number]) => string;
};

const accentStyles = {
  rose: {
    background: "bg-rose-50",
    eyebrow: "text-rose-800",
    ornament: "bg-rose-200/60",
    button: "bg-rose-800 hover:bg-rose-900 focus-visible:outline-rose-800",
    line: "bg-rose-300",
  },
  sage: {
    background: "bg-emerald-50",
    eyebrow: "text-emerald-900",
    ornament: "bg-emerald-200/60",
    button:
      "bg-emerald-900 hover:bg-emerald-950 focus-visible:outline-emerald-900",
    line: "bg-emerald-300",
  },
  gold: {
    background: "bg-amber-50",
    eyebrow: "text-amber-900",
    ornament: "bg-amber-200/70",
    button: "bg-amber-900 hover:bg-amber-950 focus-visible:outline-amber-900",
    line: "bg-amber-300",
  },
} as const;

const timezoneLabels = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
} as const;

function eventSchedule(event: InvitationDocument["events"][number]) {
  return {
    date: new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: event.timezone,
    }).format(new Date(event.startsAt)),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: event.timezone,
    }).format(new Date(event.startsAt)),
  };
}

export function ModernMinimalTemplate({
  afterSections,
  document,
  mediaUrl = (media) => getInvitationMediaPublicUrl(media.id),
}: ModernMinimalTemplateProps) {
  const accent = accentStyles[document.presentation.accent];
  const headingFont =
    document.presentation.typography === "elegant" ? "font-serif" : "font-sans";
  const firstSchedule = eventSchedule(document.events[0]);
  const cover = document.media.find((item) => item.kind === "cover");
  const gallery = document.media.filter((item) => item.kind === "gallery");
  const mappableEvents = document.events.filter((event) => event.mapUrl);
  const hasGift = Boolean(
    document.content.giftBankName ||
    document.content.giftAccountNumber ||
    document.content.giftAccountHolder,
  );
  const hasClosing = Boolean(
    document.content.closingMessage ||
    document.content.contactName ||
    document.content.contactPhone,
  );

  const sections: Record<
    InvitationDocument["presentation"]["sections"][number],
    ReactNode
  > = {
    hero: (
      <section
        key="hero"
        className={`relative flex min-h-[72svh] items-center justify-center overflow-hidden px-5 py-20 text-center ${accent.background}`}
      >
        {cover ? (
          <>
            <Image
              src={mediaUrl(cover)}
              alt={cover.altText || "Foto sampul pasangan"}
              fill
              priority
              sizes="100vw"
              unoptimized
              className="object-cover"
            />
            <span className="absolute inset-0 bg-stone-950/55" />
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className={`absolute -top-20 -right-20 size-56 rounded-full blur-2xl ${accent.ornament}`}
            />
            <span
              aria-hidden="true"
              className={`absolute -bottom-24 -left-24 size-64 rounded-full blur-3xl ${accent.ornament}`}
            />
          </>
        )}
        <div className="relative mx-auto max-w-3xl">
          <p
            className={`text-xs font-semibold tracking-[0.28em] uppercase ${cover ? "text-white" : accent.eyebrow}`}
          >
            Undangan pernikahan
          </p>
          <div className={`mt-7 ${headingFont}`}>
            <h1
              className={`text-5xl leading-none tracking-tight sm:text-7xl ${cover ? "text-white" : "text-stone-950"}`}
            >
              {document.couple.partnerOneName}
            </h1>
            <p
              className={`my-4 text-2xl ${cover ? "text-white/70" : "text-stone-400"}`}
            >
              &amp;
            </p>
            <p
              className={`text-5xl leading-none tracking-tight sm:text-7xl ${cover ? "text-white" : "text-stone-950"}`}
            >
              {document.couple.partnerTwoName}
            </p>
          </div>
          <div
            aria-hidden="true"
            className={`mx-auto mt-9 h-px w-20 ${cover ? "bg-white/60" : accent.line}`}
          />
          <p
            className={`mt-7 text-sm tracking-[0.16em] uppercase sm:text-base ${cover ? "text-white" : "text-stone-600"}`}
          >
            {firstSchedule.date}
          </p>
        </div>
      </section>
    ),
    events: (
      <section key="events" className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p
            className={`text-xs font-semibold tracking-[0.24em] uppercase ${accent.eyebrow}`}
          >
            Rangkaian acara
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {document.events.map((event) => {
              const schedule = eventSchedule(event);
              return (
                <article
                  key={`${event.name}-${event.startsAt}`}
                  className="rounded-3xl border border-stone-200 p-7"
                >
                  <h2 className={`text-3xl text-stone-950 ${headingFont}`}>
                    {event.name}
                  </h2>
                  <p className="mt-5 leading-7 text-stone-700">
                    {schedule.date}
                    <br />
                    {schedule.time} {timezoneLabels[event.timezone]}
                  </p>
                  <p className="mt-5 leading-7 text-stone-700">
                    <strong>{event.venueName}</strong>
                    <br />
                    {event.address}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ),
    story: document.content.story ? (
      <section
        key="story"
        className={`${accent.background} px-5 py-20 sm:py-28`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className={`text-xs font-semibold tracking-[0.24em] uppercase ${accent.eyebrow}`}
          >
            Cerita kami
          </p>
          <h2 className={`mt-4 text-4xl text-stone-950 ${headingFont}`}>
            Perjalanan menuju hari bahagia
          </h2>
          <p className="mt-7 whitespace-pre-line leading-8 text-stone-700">
            {document.content.story}
          </p>
        </div>
      </section>
    ) : null,
    gallery: gallery.length ? (
      <section key="gallery" className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className={`text-center text-4xl text-stone-950 ${headingFont}`}>
            Galeri
          </h2>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((image, index) => (
              <div
                key={image.id}
                className={`relative overflow-hidden rounded-2xl ${index === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
              >
                <Image
                  src={mediaUrl(image)}
                  alt={image.altText || `Foto galeri ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    map: mappableEvents.length ? (
      <section
        key="map"
        className={`${accent.background} px-5 py-20 text-center sm:py-28`}
      >
        <div className="mx-auto max-w-3xl">
          <h2 className={`text-4xl text-stone-950 ${headingFont}`}>
            Lokasi acara
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {mappableEvents.map((event) => (
              <a
                key={`${event.name}-${event.mapUrl}`}
                href={event.mapUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-h-11 items-center rounded-full px-6 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.button}`}
              >
                Buka lokasi {event.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gifts: hasGift ? (
      <section key="gifts" className="bg-white px-5 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-xl">
          <h2 className={`text-4xl text-stone-950 ${headingFont}`}>
            Tanda kasih
          </h2>
          <p className="mt-4 leading-7 text-stone-600">
            Kehadiran dan doa Anda adalah hadiah terbaik bagi kami.
          </p>
          <dl className="mt-8 rounded-2xl border border-stone-200 p-6 text-stone-800">
            <dt className="text-sm text-stone-500">Rekening</dt>
            <dd className="mt-2 font-semibold">
              {document.content.giftBankName}
            </dd>
            <dd className="mt-1 text-xl">
              {document.content.giftAccountNumber}
            </dd>
            <dd className="mt-1 text-sm">
              a.n. {document.content.giftAccountHolder}
            </dd>
          </dl>
        </div>
      </section>
    ) : null,
    closing: hasClosing ? (
      <section
        key="closing"
        className="bg-stone-950 px-5 py-20 text-center text-white sm:py-28"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className={`text-4xl ${headingFont}`}>Terima kasih</h2>
          {document.content.closingMessage ? (
            <p className="mt-6 whitespace-pre-line leading-8 text-stone-300">
              {document.content.closingMessage}
            </p>
          ) : null}
          {document.content.contactName || document.content.contactPhone ? (
            <p className="mt-7 text-sm text-stone-400">
              Kontak: {document.content.contactName}
              {document.content.contactPhone
                ? ` · ${document.content.contactPhone}`
                : ""}
            </p>
          ) : null}
        </div>
      </section>
    ) : null,
  };

  return (
    <article className="min-w-0 overflow-hidden bg-white text-stone-900">
      {document.presentation.sections.map((section) => sections[section])}
      {afterSections}
      <footer className="border-t border-stone-200 bg-stone-950 px-5 py-8 text-center text-sm text-stone-400">
        Dibuat dengan UndanganDigital
      </footer>
    </article>
  );
}
