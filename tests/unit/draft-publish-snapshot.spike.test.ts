import { describe, expect, it } from "vitest";
import { z } from "zod";

const draftContentSchema = z.object({
  schemaVersion: z.literal(1),
  couple: z.object({
    firstName: z.string().min(1),
    secondName: z.string().min(1),
  }),
  presentation: z.object({
    accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    sections: z.array(z.string()).min(1),
  }),
});

function createPublishedSnapshot(draft: unknown) {
  return structuredClone(draftContentSchema.parse(draft));
}

describe("draft/published JSON snapshot spike", () => {
  it("creates a validated snapshot that is isolated from later draft edits", () => {
    const draft = {
      schemaVersion: 1 as const,
      couple: { firstName: "Ayu", secondName: "Bima" },
      presentation: {
        accentColor: "#9f1239",
        sections: ["cover", "event"],
      },
    };

    const published = createPublishedSnapshot(draft);
    draft.couple.firstName = "Changed";

    expect(published.couple.firstName).toBe("Ayu");
    expect(published.schemaVersion).toBe(1);
  });

  it("rejects invalid content before a snapshot is published", () => {
    expect(() =>
      createPublishedSnapshot({ schemaVersion: 1, couple: {} }),
    ).toThrow();
  });
});
