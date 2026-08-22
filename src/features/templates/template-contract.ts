import type { ReactNode } from "react";

import type { InvitationDocument } from "@/features/invitations/content";

export type InvitationTemplateProps = {
  afterSections?: ReactNode;
  document: InvitationDocument;
  mediaUrl?: (media: InvitationDocument["media"][number]) => string;
};

export const timezoneLabels = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
} as const;

export function eventSchedule(event: InvitationDocument["events"][number]) {
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

export function templateContent(document: InvitationDocument) {
  return {
    cover: document.media.find((item) => item.kind === "cover"),
    gallery: document.media.filter((item) => item.kind === "gallery"),
    mappableEvents: document.events.filter((event) => event.mapUrl),
    hasGift: Boolean(
      document.content.giftBankName ||
      document.content.giftAccountNumber ||
      document.content.giftAccountHolder,
    ),
    hasClosing: Boolean(
      document.content.closingMessage ||
      document.content.contactName ||
      document.content.contactPhone,
    ),
  };
}
