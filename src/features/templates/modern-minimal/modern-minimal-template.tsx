import type { ReactNode } from "react";

import type { InvitationDocumentV1 } from "@/features/invitations/content";

type ModernMinimalTemplateProps = {
  afterSections?: ReactNode;
  document: InvitationDocumentV1;
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

export function ModernMinimalTemplate({
  afterSections,
  document,
}: ModernMinimalTemplateProps) {
  const accent = accentStyles[document.presentation.accent];
  const headingFont =
    document.presentation.typography === "elegant" ? "font-serif" : "font-sans";
  const eventDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: document.event.timezone,
  }).format(new Date(document.event.startsAt));
  const eventTime = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: document.event.timezone,
  }).format(new Date(document.event.startsAt));

  const sections = {
    hero: (
      <section
        key="hero"
        className={`relative flex min-h-[72svh] items-center justify-center overflow-hidden px-5 py-20 text-center ${accent.background}`}
      >
        <span
          aria-hidden="true"
          className={`absolute -top-20 -right-20 size-56 rounded-full blur-2xl ${accent.ornament}`}
        />
        <span
          aria-hidden="true"
          className={`absolute -bottom-24 -left-24 size-64 rounded-full blur-3xl ${accent.ornament}`}
        />
        <div className="relative mx-auto max-w-3xl">
          <p
            className={`text-xs font-semibold tracking-[0.28em] uppercase ${accent.eyebrow}`}
          >
            Undangan pernikahan
          </p>
          <div className={`mt-7 ${headingFont}`}>
            <h1 className="text-5xl leading-none tracking-tight text-stone-950 sm:text-7xl">
              {document.couple.partnerOneName}
            </h1>
            <p className="my-4 text-2xl text-stone-400">&amp;</p>
            <p className="text-5xl leading-none tracking-tight text-stone-950 sm:text-7xl">
              {document.couple.partnerTwoName}
            </p>
          </div>
          <div
            aria-hidden="true"
            className={`mx-auto mt-9 h-px w-20 ${accent.line}`}
          />
          <p className="mt-7 text-sm tracking-[0.16em] text-stone-600 uppercase sm:text-base">
            {eventDate}
          </p>
        </div>
      </section>
    ),
    event: (
      <section key="event" className="bg-white px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className={`text-xs font-semibold tracking-[0.24em] uppercase ${accent.eyebrow}`}
          >
            Rangkaian acara
          </p>
          <h2
            className={`mt-4 text-4xl tracking-tight text-stone-950 sm:text-5xl ${headingFont}`}
          >
            {document.event.name}
          </h2>
          <dl className="mt-10 grid gap-8 border-y border-stone-200 py-9 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
                Waktu
              </dt>
              <dd className="mt-2 leading-7 text-stone-800">
                {eventDate}
                <br />
                {eventTime} {timezoneLabels[document.event.timezone]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
                Lokasi
              </dt>
              <dd className="mt-2 leading-7 text-stone-800">
                <span className="font-semibold">
                  {document.event.venueName}
                </span>
                <br />
                {document.event.address}
              </dd>
            </div>
          </dl>
          {document.event.mapUrl ? (
            <a
              href={document.event.mapUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-9 inline-flex min-h-11 items-center rounded-full px-6 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.button}`}
            >
              Buka lokasi
            </a>
          ) : null}
        </div>
      </section>
    ),
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
