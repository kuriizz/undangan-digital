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
  "indigo-gold": {
    dark: "bg-[#17213d]",
    paper: "bg-[#f5eddb]",
    soft: "bg-[#dfc78f]",
    ink: "text-[#17213d]",
    light: "text-[#f5eddb]",
    accent: "text-[#b8892f]",
    border: "border-[#b8892f]",
    button: "bg-[#17213d] hover:bg-[#26345c] focus-visible:outline-[#17213d]",
  },
  "terracotta-sand": {
    dark: "bg-[#7e3525]",
    paper: "bg-[#f6ead7]",
    soft: "bg-[#dfb48c]",
    ink: "text-[#51271e]",
    light: "text-[#fff7e9]",
    accent: "text-[#a94f35]",
    border: "border-[#a94f35]",
    button: "bg-[#7e3525] hover:bg-[#65291d] focus-visible:outline-[#7e3525]",
  },
  "forest-brass": {
    dark: "bg-[#173c34]",
    paper: "bg-[#f1ead8]",
    soft: "bg-[#c9b778]",
    ink: "text-[#173c34]",
    light: "text-[#f8f1df]",
    accent: "text-[#9a742c]",
    border: "border-[#9a742c]",
    button: "bg-[#173c34] hover:bg-[#0f2d27] focus-visible:outline-[#173c34]",
  },
} as const;

function GeometricBand({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 32"
      preserveAspectRatio="none"
      className={`h-8 w-full ${className}`}
    >
      <defs>
        <pattern
          id="woven-diamond"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M16 1 31 16 16 31 1 16Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="m16 8 8 8-8 8-8-8Z" fill="currentColor" fillOpacity=".28" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woven-diamond)" />
    </svg>
  );
}

export function NusantaraContemporaryTemplate({
  afterSections,
  document,
  mediaUrl = (media) => getInvitationMediaPublicUrl(media.id),
}: InvitationTemplateProps) {
  const accentKey =
    document.presentation.templateKey === "nusantara-contemporary"
      ? document.presentation.accent
      : "indigo-gold";
  const palette = palettes[accentKey];
  const headingFont =
    document.presentation.templateKey === "nusantara-contemporary" &&
    document.presentation.typography === "geometric-sans"
      ? "font-sans font-bold tracking-tight"
      : "font-serif font-semibold";
  const firstSchedule = eventSchedule(document.events[0]);
  const { cover, gallery, mappableEvents, hasGift, hasClosing } =
    templateContent(document);

  const title = (eyebrow: string, heading: string) => (
    <header>
      <p
        className={`text-xs font-bold tracking-[0.28em] uppercase ${palette.accent}`}
      >
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-4xl sm:text-5xl ${headingFont} ${palette.ink}`}>
        {heading}
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
        className={`relative overflow-hidden ${palette.dark}`}
      >
        <GeometricBand className={palette.accent} />
        <div className="mx-auto grid min-h-[78svh] max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-10">
          <div className="relative z-10 py-8 text-center md:text-left">
            <p
              className={`text-xs font-bold tracking-[0.32em] uppercase ${palette.accent}`}
            >
              Undangan pernikahan
            </p>
            <h1
              className={`mt-7 text-5xl leading-[0.95] sm:text-7xl ${headingFont} ${palette.light}`}
            >
              {document.couple.partnerOneName}
              <span className={`my-3 block text-2xl ${palette.accent}`}>
                &amp;
              </span>
              {document.couple.partnerTwoName}
            </h1>
            <p
              className={`mt-8 text-sm font-semibold tracking-wide ${palette.light}`}
            >
              {firstSchedule.date}
            </p>
          </div>
          <div
            className={`relative mx-auto aspect-square w-full max-w-lg border-8 ${palette.border}`}
          >
            <span
              aria-hidden="true"
              className={`absolute -top-5 -left-5 z-10 size-16 border-t-4 border-l-4 ${palette.border}`}
            />
            <span
              aria-hidden="true"
              className={`absolute -right-5 -bottom-5 z-10 size-16 border-r-4 border-b-4 ${palette.border}`}
            />
            {cover ? (
              <Image
                src={mediaUrl(cover)}
                alt={cover.altText || "Foto sampul pasangan"}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 90vw"
                unoptimized
                className="object-cover grayscale-[15%]"
              />
            ) : (
              <div
                className={`grid size-full place-items-center ${palette.paper}`}
              >
                <GeometricBand className={`w-3/4 ${palette.accent}`} />
              </div>
            )}
          </div>
        </div>
        <GeometricBand className={palette.accent} />
      </section>
    ),
    events: (
      <section key="events" className={`px-5 py-20 sm:py-28 ${palette.paper}`}>
        <div className="mx-auto max-w-5xl">
          {title("Rangkaian", "Hari perayaan")}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {document.events.map((event, index) => {
              const schedule = eventSchedule(event);
              return (
                <article
                  key={`${event.name}-${event.startsAt}`}
                  className={`border-l-8 bg-white p-7 shadow-sm ${palette.border}`}
                >
                  <p
                    className={`text-xs font-bold tracking-[0.2em] uppercase ${palette.accent}`}
                  >
                    Acara {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className={`mt-3 text-3xl ${headingFont} ${palette.ink}`}>
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
      <section key="story" className={`px-5 py-20 sm:py-28 ${palette.soft}`}>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.8fr_1.2fr]">
          {title("Jejak bersama", "Cerita kami")}
          <p
            className={`whitespace-pre-line border-l-2 pl-6 leading-8 ${palette.border} ${palette.ink}`}
          >
            {document.content.story}
          </p>
        </div>
      </section>
    ) : null,
    gallery: gallery.length ? (
      <section key="gallery" className={`px-5 py-20 sm:py-28 ${palette.dark}`}>
        <div className="mx-auto max-w-6xl">
          <header className="text-center">
            <p
              className={`text-xs font-bold tracking-[0.28em] uppercase ${palette.accent}`}
            >
              Fragmen
            </p>
            <h2
              className={`mt-3 text-4xl sm:text-5xl ${headingFont} ${palette.light}`}
            >
              Galeri kenangan
            </h2>
          </header>
          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {gallery.map((image, index) => (
              <div
                key={image.id}
                className={`relative overflow-hidden ${index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
              >
                <Image
                  src={mediaUrl(image)}
                  alt={image.altText || `Foto galeri ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    map: mappableEvents.length ? (
      <section key="map" className={`px-5 py-20 sm:py-28 ${palette.paper}`}>
        <div className="mx-auto max-w-4xl text-center">
          {title("Arah perjalanan", "Lokasi acara")}
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {mappableEvents.map((event) => (
              <a
                key={`${event.name}-${event.mapUrl}`}
                href={event.mapUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-h-11 items-center px-6 font-bold text-white transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 ${palette.button}`}
              >
                Buka lokasi {event.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gifts: hasGift ? (
      <section key="gifts" className={`px-5 py-20 sm:py-28 ${palette.soft}`}>
        <div className="mx-auto max-w-3xl">
          {title("Tulus dari hati", "Tanda kasih")}
          <div className="mt-8 grid gap-6 bg-white p-7 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="leading-7 text-stone-600">
                Kehadiran dan doa Anda adalah hadiah terbaik bagi kami.
              </p>
              <dl className={`mt-5 ${palette.ink}`}>
                <dt className="text-sm text-stone-500">Rekening</dt>
                <dd className="mt-1 font-bold">
                  {document.content.giftBankName}
                </dd>
                <dd className="mt-1 text-2xl">
                  {document.content.giftAccountNumber}
                </dd>
                <dd className="mt-1 text-sm">
                  a.n. {document.content.giftAccountHolder}
                </dd>
              </dl>
            </div>
            <GeometricBand className={`w-36 ${palette.accent}`} />
          </div>
        </div>
      </section>
    ) : null,
    closing: hasClosing ? (
      <section
        key="closing"
        className={`px-5 py-24 text-center ${palette.dark} ${palette.light}`}
      >
        <div className="mx-auto max-w-2xl">
          <GeometricBand className={`mx-auto max-w-xs ${palette.accent}`} />
          <h2 className={`mt-8 text-5xl ${headingFont}`}>Terima kasih</h2>
          {document.content.closingMessage ? (
            <p className="mt-6 whitespace-pre-line leading-8 opacity-80">
              {document.content.closingMessage}
            </p>
          ) : null}
          {document.content.contactName || document.content.contactPhone ? (
            <p className="mt-7 text-sm opacity-70">
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
      data-template="nusantara-contemporary"
      className={`min-w-0 overflow-hidden ${palette.paper} ${palette.ink}`}
    >
      {document.presentation.sections.map((section) => sections[section])}
      {afterSections}
      <footer
        className={`border-t px-5 py-8 text-center text-sm ${palette.border} ${palette.paper} ${palette.ink}`}
      >
        Dibuat dengan UndanganDigital
      </footer>
    </article>
  );
}
