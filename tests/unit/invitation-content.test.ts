import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  createInvitationDocument,
  invitationDocumentSchema,
  invitationDocumentV2Schema,
} from "@/features/invitations/content";
import { createInvitationMetadata } from "@/features/invitations/metadata";
import { ModernMinimalTemplate } from "@/features/templates/modern-minimal/modern-minimal-template";

const draft = {
  schemaVersion: 2,
  couple: {
    partnerOneName: "Ayu",
    partnerTwoName: "Bima",
  },
  content: {
    story: "Kami bertemu di Jakarta.",
    giftBankName: "Bank Bahagia",
    giftAccountNumber: "123456",
    giftAccountHolder: "Ayu",
    closingMessage: "Sampai berjumpa di hari bahagia kami.",
    contactName: "Bima",
    contactPhone: "+62 812 0000 0000",
  },
  presentation: {
    templateKey: "modern-minimal",
    accent: "sage",
    typography: "elegant",
    sections: ["hero", "story", "events", "map", "gifts", "closing"],
  },
};

const events = [
  {
    name: "Akad nikah",
    startsAt: "2027-01-10T02:30:00.000Z",
    timezone: "Asia/Jakarta",
    venueName: "Gedung Bahagia",
    address: "Jakarta Selatan",
    mapUrl: "https://maps.example.test/gedung",
  },
  {
    name: "Resepsi",
    startsAt: "2027-01-10T05:00:00.000Z",
    timezone: "Asia/Jakarta",
    venueName: "Gedung Bahagia",
    address: "Jakarta Selatan",
    mapUrl: null,
  },
];

describe("versioned invitation content", () => {
  it("composes relational events into a validated v2 render document", () => {
    const document = createInvitationDocument(draft, events);

    expect(document.schemaVersion).toBe(2);
    expect(document.events).toHaveLength(2);
    expect(invitationDocumentV2Schema.safeParse(document).success).toBe(true);
  });

  it("normalizes a published v1 snapshot for backward-compatible rendering", () => {
    const result = invitationDocumentSchema.parse({
      schemaVersion: 1,
      couple: draft.couple,
      presentation: {
        templateKey: "modern-minimal",
        accent: "rose",
        typography: "elegant",
        sections: ["hero", "event"],
      },
      event: events[0],
    });

    expect(result.schemaVersion).toBe(2);
    expect(result.presentation.sections).toEqual(["hero", "events"]);
  });
});

describe("Modern Minimal presentation", () => {
  it("renders ordered visible content without querying data", () => {
    const document = createInvitationDocument(draft, events);
    const html = renderToStaticMarkup(
      createElement(ModernMinimalTemplate, { document }),
    );

    expect(html).toContain("Ayu");
    expect(html).toContain("Akad nikah");
    expect(html).toContain("Resepsi");
    expect(html).toContain("Kami bertemu di Jakarta.");
    expect(html).toContain("Bank Bahagia");
    expect(html.indexOf("Cerita kami")).toBeLessThan(
      html.indexOf("Rangkaian acara"),
    );
  });

  it("creates preview-safe metadata from the first event", () => {
    const document = createInvitationDocument(draft, events);
    const metadata = createInvitationMetadata(document, { preview: true });

    expect(metadata.title).toBe("Preview Ayu & Bima | UndanganDigital");
    expect(metadata.description).toContain("Gedung Bahagia");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
