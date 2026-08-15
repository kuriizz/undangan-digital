import { z } from "zod";

export const invitationAccentKeys = ["rose", "sage", "gold"] as const;
export const invitationTypographyKeys = ["modern", "elegant"] as const;

export const invitationPresentationSchema = z.object({
  templateKey: z.literal("modern-minimal"),
  accent: z.enum(invitationAccentKeys),
  typography: z.enum(invitationTypographyKeys),
  sections: z
    .array(z.enum(["hero", "event"]))
    .length(2)
    .refine((sections) => new Set(sections).size === sections.length),
});

export const DEFAULT_INVITATION_PRESENTATION = {
  templateKey: "modern-minimal",
  accent: "rose",
  typography: "elegant",
  sections: ["hero", "event"],
} as const;

export const storedInvitationDraftV1Schema = z.object({
  schemaVersion: z.literal(1),
  couple: z.object({
    partnerOneName: z.string().trim().min(1).max(100),
    partnerTwoName: z.string().trim().min(1).max(100),
  }),
  presentation: invitationPresentationSchema,
});

export const invitationEventV1Schema = z.object({
  name: z.string().trim().min(1).max(100),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
  venueName: z.string().trim().min(1).max(150),
  address: z.string().trim().min(1).max(500),
  mapUrl: z.string().url().max(2048).nullable(),
});

export const invitationDocumentV1Schema = storedInvitationDraftV1Schema.extend({
  event: invitationEventV1Schema,
});

export type StoredInvitationDraftV1 = z.infer<
  typeof storedInvitationDraftV1Schema
>;
export type InvitationDocumentV1 = z.infer<typeof invitationDocumentV1Schema>;

export function createInvitationDocument(
  draft: unknown,
  event: unknown,
): InvitationDocumentV1 {
  return invitationDocumentV1Schema.parse({
    ...storedInvitationDraftV1Schema.parse(draft),
    event: invitationEventV1Schema.parse(event),
  });
}
