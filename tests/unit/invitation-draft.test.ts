import { describe, expect, it } from "vitest";

import {
  invitationDraftSchema,
  invitationSlugSchema,
  normalizeSlug,
  toDraftContent,
  toEventTimestamp,
} from "@/features/invitations/schemas";

const validDraft = {
  invitationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  slug: "ayu-bima",
  partnerOneName: "Ayu",
  partnerTwoName: "Bima",
  eventName: "Akad nikah",
  eventDate: "2027-01-10",
  eventTime: "09:30",
  timezone: "Asia/Jakarta",
  venueName: "Gedung Bahagia",
  address: "Jakarta",
  mapUrl: "https://maps.example.test/gedung",
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
  it("validates and converts the first event to UTC", () => {
    const input = invitationDraftSchema.parse(validDraft);

    expect(toEventTimestamp(input)).toBe("2027-01-10T02:30:00.000Z");
    expect(toDraftContent(input)).toEqual({
      schemaVersion: 1,
      couple: { partnerOneName: "Ayu", partnerTwoName: "Bima" },
    });
  });

  it("rejects impossible dates and invalid map URLs", () => {
    expect(
      invitationDraftSchema.safeParse({
        ...validDraft,
        eventDate: "2027-02-30",
      }).success,
    ).toBe(false);
    expect(
      invitationDraftSchema.safeParse({ ...validDraft, mapUrl: "bukan-url" })
        .success,
    ).toBe(false);
  });
});
