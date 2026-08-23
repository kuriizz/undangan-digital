import { describe, expect, it } from "vitest";

import { abuseReportSchema } from "@/features/abuse/schemas";

const validReport = {
  slug: "ayu-bima",
  category: "privacy",
  details: "Data personal saya tampil tanpa izin.",
  contactEmail: "reporter@example.test",
  website: "",
  idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
};

describe("abuse report validation", () => {
  it("accepts a constrained report", () => {
    expect(abuseReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("rejects short details, invalid email, and honeypot input", () => {
    expect(
      abuseReportSchema.safeParse({ ...validReport, details: "singkat" })
        .success,
    ).toBe(false);
    expect(
      abuseReportSchema.safeParse({ ...validReport, contactEmail: "invalid" })
        .success,
    ).toBe(false);
    expect(
      abuseReportSchema.safeParse({ ...validReport, website: "bot" }).success,
    ).toBe(false);
  });
});
