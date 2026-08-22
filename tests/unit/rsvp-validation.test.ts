import { describe, expect, it } from "vitest";

import { publicRsvpSchema } from "@/features/rsvp/schemas";

const validRsvp = {
  slug: "ayu-bima",
  name: "Tamu Uji",
  attendance: "attending",
  partySize: "2",
  note: "Sampai jumpa",
  wish: "Semoga berbahagia selalu",
  guestToken: "",
  idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
};

describe("public RSVP validation", () => {
  it("normalizes a valid attending response", () => {
    const result = publicRsvpSchema.parse(validRsvp);

    expect(result.name).toBe("Tamu Uji");
    expect(result.partySize).toBe(2);
  });

  it("requires zero guests when not attending", () => {
    expect(
      publicRsvpSchema.safeParse({
        ...validRsvp,
        attendance: "not_attending",
        partySize: "2",
      }).success,
    ).toBe(false);
    expect(
      publicRsvpSchema.safeParse({
        ...validRsvp,
        attendance: "not_attending",
        partySize: "0",
      }).success,
    ).toBe(true);
  });

  it("enforces the public party and note limits", () => {
    expect(
      publicRsvpSchema.safeParse({ ...validRsvp, partySize: "11" }).success,
    ).toBe(false);
    expect(
      publicRsvpSchema.safeParse({ ...validRsvp, note: "a".repeat(501) })
        .success,
    ).toBe(false);
    expect(
      publicRsvpSchema.safeParse({ ...validRsvp, wish: "a".repeat(501) })
        .success,
    ).toBe(false);
  });
});
