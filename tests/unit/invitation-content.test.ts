import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import {
  createInvitationDocument,
  invitationDocumentV1Schema,
} from "@/features/invitations/content";
import { createInvitationMetadata } from "@/features/invitations/metadata";
import { ModernMinimalTemplate } from "@/features/templates/modern-minimal/modern-minimal-template";

const draft = {
  schemaVersion: 1,
  couple: {
    partnerOneName: "Ayu",
    partnerTwoName: "Bima",
  },
  presentation: {
    templateKey: "modern-minimal",
    accent: "sage",
    typography: "elegant",
    sections: ["hero", "event"],
  },
};

const event = {
  name: "Akad nikah",
  startsAt: "2027-01-10T02:30:00.000Z",
  timezone: "Asia/Jakarta",
  venueName: "Gedung Bahagia",
  address: "Jakarta Selatan",
  mapUrl: "https://maps.example.test/gedung",
};

describe("versioned invitation content", () => {
  it("composes relational event data into a validated v1 render document", () => {
    const document = createInvitationDocument(draft, event);

    expect(document.schemaVersion).toBe(1);
    expect(document.event.timezone).toBe("Asia/Jakarta");
    expect(invitationDocumentV1Schema.safeParse(document).success).toBe(true);
  });

  it("rejects unknown schema versions and incomplete presentation data", () => {
    expect(
      createInvitationDocument.bind(
        null,
        { ...draft, schemaVersion: 2 },
        event,
      ),
    ).toThrow();
    expect(
      createInvitationDocument.bind(
        null,
        { ...draft, presentation: { templateKey: "modern-minimal" } },
        event,
      ),
    ).toThrow();
  });
});

describe("Modern Minimal presentation", () => {
  it("renders the validated couple and event without querying data", () => {
    const document = createInvitationDocument(draft, event);
    const html = renderToStaticMarkup(
      createElement(ModernMinimalTemplate, { document }),
    );

    expect(html).toContain("Ayu");
    expect(html).toContain("Bima");
    expect(html).toContain("Akad nikah");
    expect(html).toContain("Gedung Bahagia");
    expect(html).toContain("Buka lokasi");
  });

  it("creates preview-safe metadata that can be reused for publishing", () => {
    const document = createInvitationDocument(draft, event);
    const metadata = createInvitationMetadata(document, { preview: true });

    expect(metadata.title).toBe("Preview Ayu & Bima | UndanganDigital");
    expect(metadata.description).toContain("Gedung Bahagia");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
