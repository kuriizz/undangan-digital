import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  createInvitationDocument,
  invitationDocumentSchema,
  invitationDocumentV2Schema,
} from "@/features/invitations/content";
import { createInvitationMetadata } from "@/features/invitations/metadata";
import {
  invitationTemplateCatalog,
  invitationTemplates,
  normalizeTemplateSelection,
} from "@/features/templates/catalog";
import { InvitationTemplate } from "@/features/templates/invitation-template";

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

  it("rejects presets that do not belong to the selected template", () => {
    expect(
      invitationDocumentV2Schema.safeParse({
        ...draft,
        presentation: {
          ...draft.presentation,
          templateKey: "elegant-floral",
        },
        events,
        media: [],
      }).success,
    ).toBe(false);
  });
});

describe("template presentation", () => {
  it("registers three distinct templates and maps incompatible presets", () => {
    expect(invitationTemplates.map((template) => template.key)).toEqual([
      "modern-minimal",
      "elegant-floral",
      "nusantara-contemporary",
    ]);
    expect(
      normalizeTemplateSelection("elegant-floral", "sage", "modern"),
    ).toEqual({
      templateKey: "elegant-floral",
      accent: "ivory-rose",
      typography: "romantic-serif",
    });
    expect(
      invitationTemplateCatalog["nusantara-contemporary"].accents,
    ).toHaveLength(3);
  });

  it("renders ordered visible content without querying data", () => {
    const document = createInvitationDocument(draft, events);
    const html = renderToStaticMarkup(
      createElement(InvitationTemplate, { document }),
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

  it.each([
    ["modern-minimal", "rose", "elegant"],
    ["elegant-floral", "ivory-rose", "romantic-serif"],
    ["nusantara-contemporary", "indigo-gold", "contemporary-serif"],
  ] as const)(
    "renders all available content with %s while preserving section order",
    (templateKey, accent, typography) => {
      const document = createInvitationDocument(
        {
          ...draft,
          presentation: {
            templateKey,
            accent,
            typography,
            sections: [
              "hero",
              "story",
              "events",
              "gallery",
              "map",
              "gifts",
              "closing",
            ],
          },
        },
        events,
        [
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            kind: "gallery",
            path: "owner/invitation/gallery.jpg",
            altText: "Kenangan bersama",
            sortOrder: 0,
          },
        ],
      );
      const html = renderToStaticMarkup(
        createElement(InvitationTemplate, {
          document,
          mediaUrl: () => "/media/test.jpg",
        }),
      );

      expect(html).toContain(`data-template="${templateKey}"`);
      expect(html).toContain("Kami bertemu di Jakarta.");
      expect(html).toContain("Kenangan bersama");
      expect(html).toContain("Bank Bahagia");
      expect(html.indexOf("Kami bertemu di Jakarta.")).toBeLessThan(
        html.indexOf("Akad nikah"),
      );
    },
  );

  it("does not render sections hidden by the owner", () => {
    const document = createInvitationDocument(
      {
        ...draft,
        presentation: {
          ...draft.presentation,
          sections: ["hero", "events"],
        },
      },
      events,
    );
    const html = renderToStaticMarkup(
      createElement(InvitationTemplate, { document }),
    );

    expect(html).not.toContain("Kami bertemu di Jakarta.");
    expect(html).not.toContain("Bank Bahagia");
  });

  it("creates preview-safe metadata from the first event", () => {
    const document = createInvitationDocument(draft, events);
    const metadata = createInvitationMetadata(document, { preview: true });

    expect(metadata.title).toBe("Preview Ayu & Bima | UndanganDigital");
    expect(metadata.description).toContain("Gedung Bahagia");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
