import Image from "next/image";
import type { ReactNode } from "react";

import type { InvitationDocument } from "@/features/invitations/content";
import { getInvitationMediaPublicUrl } from "@/features/media/public-url";
import {
  eventSchedule,
  templateContent,
  timezoneLabels,
  type InvitationTemplateProps,
} from "@/features/templates/template-contract";

const palettes = {
  "ivory-rose": {
    paper: "bg-[#fffaf5]",
    soft: "bg-[#f8e9e7]",
    ink: "text-[#522d36]",
    muted: "text-[#7a5660]",
    border: "border-[#d8aaa8]",
    button: "bg-[#7d3f50] hover:bg-[#63303f] focus-visible:outline-[#7d3f50]",
    ornament: "text-[#b26f7c]",
  },
  "blush-burgundy": {
    paper: "bg-[#fff7f7]",
    soft: "bg-[#f3dfe2]",
    ink: "text-[#571d2b]",
    muted: "text-[#7d4a55]",
    border: "border-[#c88d99]",
    button: "bg-[#761f36] hover:bg-[#5d172a] focus-visible:outline-[#761f36]",
    ornament: "text-[#a94d63]",
  },
  "champagne-plum": {
    paper: "bg-[#fffaf0]",
    soft: "bg-[#efe3d3]",
    ink: "text-[#4f2947]",
    muted: "text-[#75536e]",
    border: "border-[#c7a77d]",
    button: "bg-[#603653] hover:bg-[#4b2941] focus-visible:outline-[#603653]",
    ornament: "text-[#9a726a]",
  },
} as const;

function BotanicalOrnament({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 180"
      className={className}
      fill="none"
    >
      <path
        d="M18 164C45 126 52 80 93 39C112 20 135 13 163 17"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M52 118C29 113 22 94 25 76C44 78 58 91 52 118ZM79 67C63 50 67 31 79 18C94 31 98 50 79 67ZM103 38C105 20 119 10 136 9C136 28 123 40 103 38ZM91 70C111 58 128 65 138 80C119 91 101 88 91 70Z"
        fill="currentColor"
        fillOpacity=".16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="55" cy="116" r="4" fill="currentColor" />
      <circle cx="95" cy="42" r="3" fill="currentColor" />
    </svg>
  );
}

export function ElegantFloralTemplate({
  afterSections,
  document,
  mediaUrl = (media) => getInvitationMediaPublicUrl(media.id),
}: InvitationTemplateProps) {
  const accentKey =
    document.presentation.templateKey === "elegant-floral"
      ? document.presentation.accent
      : "ivory-rose";
  const palette = palettes[accentKey];
  const headingFont =
    document.presentation.templateKey === "elegant-floral" &&
    document.presentation.typography === "classic-serif"
      ? "font-serif tracking-tight"
      : "font-serif italic";
  const firstSchedule = eventSchedule(document.events[0]);
  const { cover, gallery, mappableEvents, hasGift, hasClosing } =
    templateContent(document);

  const sectionHeading = (eyebrow: string, title: string) => (
    <header className="text-center">
      <p
        className={`text-xs font-semibold tracking-[0.3em] uppercase ${palette.muted}`}
      >
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl sm:text-5xl ${headingFont} ${palette.ink}`}>
        {title}
      </h2>
    </header>
  );

  const sections: Record<
    InvitationDocument["presentation"]["sections"][number],
    ReactNode
  > = {
    hero: (
      <section
        key="hero"
        className={`relative grid min-h-[82svh] place-items-center overflow-hidden px-5 py-16 ${palette.paper}`}
      >
        <BotanicalOrnament
          className={`absolute -top-7 -left-8 w-44 -rotate-6 sm:w-60 ${palette.ornament}`}
        />
        <BotanicalOrnament
          className={`absolute -right-8 -bottom-7 w-44 rotate-180 sm:w-60 ${palette.ornament}`}
        />
        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div className="text-center md:text-left">
            <p
              className={`text-xs font-semibold tracking-[0.32em] uppercase ${palette.muted}`}
            >
              Undangan pernikahan
            </p>
            <h1
              className={`mt-7 text-5xl leading-[0.95] sm:text-7xl ${headingFont} ${palette.ink}`}
            >
              {document.couple.partnerOneName}
              <span className="my-3 block text-2xl font-normal not-italic opacity-55">
                &amp;
              </span>
              {document.couple.partnerTwoName}
            </h1>
            <p className={`mt-8 text-sm leading-7 ${palette.muted}`}>
              {firstSchedule.date}
            </p>
          </div>
          <div
            className={`relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[10rem] border p-3 shadow-xl ${palette.border}`}
          >
            <div
              className={`relative size-full overflow-hidden rounded-t-[9rem] ${palette.soft}`}
            >
              {cover ? (
                <Image
                  src={mediaUrl(cover)}
                  alt={cover.altText || "Foto sampul pasangan"}
                  fill
                  priority
                  sizes="(min-width: 768px) 45vw, 90vw"
                  unoptimized
                  className="object-cover transition-transform duration-700 motion-reduce:transition-none"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <BotanicalOrnament className={`w-2/3 ${palette.ornament}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    ),
    events: (
      <section key="events" className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          {sectionHeading("Hari bahagia", "Rangkaian acara")}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {document.events.map((event) => {
              const schedule = eventSchedule(event);
              return (
                <article
                  key={`${event.name}-${event.startsAt}`}
                  className={`relative border px-6 py-9 text-center ${palette.border}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-10 top-0 h-px ${palette.soft}`}
                  />
                  <h2 className={`text-3xl ${headingFont} ${palette.ink}`}>
                    {event.name}
                  </h2>
                  <p className={`mt-5 leading-7 ${palette.muted}`}>
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
      <section key="story" className={`px-5 py-20 sm:py-28 ${palette.soft}`}>
        <div className="mx-auto max-w-3xl text-center">
          {sectionHeading("Tentang kami", "Sebuah perjalanan")}
          <p className={`mt-8 whitespace-pre-line leading-8 ${palette.ink}`}>
            {document.content.story}
          </p>
        </div>
      </section>
    ) : null,
    gallery: gallery.length ? (
      <section key="gallery" className={`px-5 py-20 sm:py-28 ${palette.paper}`}>
        <div className="mx-auto max-w-6xl">
          {sectionHeading("Kenangan", "Galeri kami")}
          <div className="mt-10 columns-2 gap-3 sm:columns-3">
            {gallery.map((image, index) => (
              <div
                key={image.id}
                className={`relative mb-3 break-inside-avoid overflow-hidden rounded-t-[4rem] ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}
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
      <section key="map" className="bg-white px-5 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          {sectionHeading("Petunjuk arah", "Lokasi acara")}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {mappableEvents.map((event) => (
              <a
                key={`${event.name}-${event.mapUrl}`}
                href={event.mapUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-h-11 items-center rounded-full px-6 font-semibold text-white transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 ${palette.button}`}
              >
                Buka lokasi {event.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gifts: hasGift ? (
      <section
        key="gifts"
        className={`px-5 py-20 text-center sm:py-28 ${palette.soft}`}
      >
        <div className="mx-auto max-w-xl">
          {sectionHeading("Dengan kasih", "Tanda kasih")}
          <p className={`mt-5 leading-7 ${palette.muted}`}>
            Kehadiran dan doa Anda adalah hadiah terbaik bagi kami.
          </p>
          <dl
            className={`mt-8 border bg-white/70 p-7 ${palette.border} ${palette.ink}`}
          >
            <dt className={`text-sm ${palette.muted}`}>Rekening</dt>
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
        className={`relative overflow-hidden px-5 py-24 text-center ${palette.paper}`}
      >
        <BotanicalOrnament
          className={`absolute -bottom-16 left-1/2 w-52 -translate-x-1/2 -rotate-45 opacity-50 ${palette.ornament}`}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className={`text-5xl ${headingFont} ${palette.ink}`}>
            Terima kasih
          </h2>
          {document.content.closingMessage ? (
            <p
              className={`mt-6 whitespace-pre-line leading-8 ${palette.muted}`}
            >
              {document.content.closingMessage}
            </p>
          ) : null}
          {document.content.contactName || document.content.contactPhone ? (
            <p className={`mt-7 text-sm ${palette.muted}`}>
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
    <article
      data-template="elegant-floral"
      className={`min-w-0 overflow-hidden ${palette.paper} ${palette.ink}`}
    >
      {document.presentation.sections.map((section) => sections[section])}
      {afterSections}
      <footer
        className={`border-t px-5 py-8 text-center text-sm ${palette.border} ${palette.muted}`}
      >
        Dibuat dengan UndanganDigital
      </footer>
    </article>
  );
}
