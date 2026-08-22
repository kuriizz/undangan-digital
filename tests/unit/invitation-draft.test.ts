import { describe, expect, it } from "vitest";

import {
  invitationDraftSchema,
  invitationSlugSchema,
  normalizeSlug,
  toDraftContent,
  toRelationalEvents,
} from "@/features/invitations/schemas";

const validDraft = {
  invitationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  slug: "ayu-bima",
  partnerOneName: "Ayu",
  partnerTwoName: "Bima",
  story: "Cerita kami",
  giftBankName: "Bank Bahagia",
  giftAccountNumber: "123456",
  giftAccountHolder: "Ayu",
  closingMessage: "Terima kasih",
  contactName: "Bima",
  contactPhone: "+62 812 0000",
  eventsJson: JSON.stringify([
    {
      name: "Akad nikah",
      date: "2027-01-10",
      time: "09:30",
      timezone: "Asia/Jakarta",
      venueName: "Gedung Bahagia",
      address: "Jakarta",
      mapUrl: "https://maps.example.test/gedung",
    },
    {
      name: "Resepsi",
      date: "2027-01-10",
      time: "12:00",
      timezone: "Asia/Jakarta",
      venueName: "Gedung Bahagia",
      address: "Jakarta",
      mapUrl: "",
    },
  ]),
  sectionsJson: JSON.stringify(["hero", "story", "events", "closing"]),
  templateKey: "modern-minimal",
  accent: "rose",
  typography: "elegant",
};

describe("invitation slug", () => {
  it("normalizes Indonesian names and repeated separators", () => {
    expect(normalizeSlug("  Déwi & Rizky  ")).toBe("dewi-rizky");
    expect(invitationSlugSchema.parse("Ayu---Bima")).toBe("ayu-bima");
  });

  it("rejects reserved and out-of-range slugs", () => {
    expect(invitationSlugSchema.safeParse("admin").success).toBe(false);
    expect(invitationSlugSchema.safeParse("ab").success).toBe(false);
    expect(invitationSlugSchema.safeParse("a".repeat(61)).success).toBe(false);
  });
});

describe("invitation draft input", () => {
  it("validates multiple events and converts them to UTC", () => {
    const input = invitationDraftSchema.parse(validDraft);
    const events = toRelationalEvents(input);

    expect(events).toHaveLength(2);
    expect(events[0].startsAt).toBe("2027-01-10T02:30:00.000Z");
    expect(toDraftContent(input)).toMatchObject({
      schemaVersion: 2,
      couple: { partnerOneName: "Ayu", partnerTwoName: "Bima" },
      content: { story: "Cerita kami" },
      presentation: {
        sections: ["hero", "story", "events", "closing"],
      },
    });
  });

  it("rejects invalid nested events and section order", () => {
    expect(
      invitationDraftSchema.safeParse({
        ...validDraft,
        eventsJson: JSON.stringify([
          {
            name: "Akad",
            date: "2027-02-30",
            time: "09:00",
            timezone: "Asia/Jakarta",
            venueName: "Gedung",
            address: "Jakarta",
            mapUrl: "",
          },
        ]),
      }).success,
    ).toBe(false);
    expect(
      invitationDraftSchema.safeParse({
        ...validDraft,
        sectionsJson: JSON.stringify(["story", "events"]),
      }).success,
    ).toBe(false);
  });

  it("preserves content when a template selection changes", () => {
    const input = invitationDraftSchema.parse({
      ...validDraft,
      templateKey: "nusantara-contemporary",
      accent: "indigo-gold",
      typography: "contemporary-serif",
    });
    const content = toDraftContent(input);

    expect(content.couple).toEqual({
      partnerOneName: "Ayu",
      partnerTwoName: "Bima",
    });
    expect(content.content.story).toBe("Cerita kami");
    expect(content.presentation).toMatchObject({
      templateKey: "nusantara-contemporary",
      accent: "indigo-gold",
      typography: "contemporary-serif",
      sections: ["hero", "story", "events", "closing"],
    });
  });

  it("rejects an accent or typography from another template", () => {
    expect(
      invitationDraftSchema.safeParse({
        ...validDraft,
        templateKey: "elegant-floral",
        accent: "rose",
        typography: "romantic-serif",
      }).success,
    ).toBe(false);
  });
});
