import { describe, expect, it } from "vitest";

import { pathWithMessage, safeRedirectPath } from "@/features/auth/navigation";
import {
  profileSchema,
  registerSchema,
  updatePasswordSchema,
} from "@/features/auth/schemas";

describe("authentication input", () => {
  it("normalizes valid registration data", () => {
    const result = registerSchema.parse({
      displayName: "  Pasangan Uji  ",
      email: "  owner@example.test  ",
      password: "rahasia-aman",
      passwordConfirmation: "rahasia-aman",
    });

    expect(result.displayName).toBe("Pasangan Uji");
    expect(result.email).toBe("owner@example.test");
  });

  it("rejects mismatched password confirmation", () => {
    expect(
      updatePasswordSchema.safeParse({
        password: "rahasia-aman",
        passwordConfirmation: "berbeda-sekali",
      }).success,
    ).toBe(false);
  });

  it("enforces the profile display-name boundary", () => {
    expect(profileSchema.safeParse({ displayName: "" }).success).toBe(false);
    expect(
      profileSchema.safeParse({ displayName: "a".repeat(101) }).success,
    ).toBe(false);
  });
});

describe("authentication navigation", () => {
  it("allows local paths and preserves their query string", () => {
    expect(safeRedirectPath("/dashboard?tab=profile")).toBe(
      "/dashboard?tab=profile",
    );
  });

  it("rejects protocol-relative and external redirects", () => {
    expect(safeRedirectPath("//evil.example/path")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.example/path")).toBe("/dashboard");
  });

  it("encodes user-facing messages", () => {
    expect(
      pathWithMessage("/login?next=%2Fdashboard", "error", "Coba lagi"),
    ).toBe("/login?next=%2Fdashboard&error=Coba+lagi");
  });
});
