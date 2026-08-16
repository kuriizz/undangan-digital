import { z } from "zod";

export const invitationAccentKeys = ["rose", "sage", "gold"] as const;
export const invitationTypographyKeys = ["modern", "elegant"] as const;
export const invitationSectionKeys = [
  "hero",
  "events",
  "story",
  "gallery",
  "map",
  "gifts",
  "closing",
] as const;

const sectionSchema = z.enum(invitationSectionKeys);

export const invitationPresentationSchema = z.object({
  templateKey: z.literal("modern-minimal"),
  accent: z.enum(invitationAccentKeys),
  typography: z.enum(invitationTypographyKeys),
  sections: z
    .array(sectionSchema)
    .min(1)
    .max(invitationSectionKeys.length)
    .refine((sections) => new Set(sections).size === sections.length)
    .refine((sections) => sections.includes("hero")),
});

export const DEFAULT_INVITATION_PRESENTATION = {
  templateKey: "modern-minimal",
  accent: "rose",
  typography: "elegant",
  sections: [...invitationSectionKeys],
} as const;

export const storedInvitationDraftV2Schema = z.object({
  schemaVersion: z.literal(2),
  couple: z.object({
    partnerOneName: z.string().trim().min(1).max(100),
    partnerTwoName: z.string().trim().min(1).max(100),
  }),
  content: z.object({
    story: z.string().trim().max(2000),
    giftBankName: z.string().trim().max(100),
    giftAccountNumber: z.string().trim().max(100),
    giftAccountHolder: z.string().trim().max(100),
    closingMessage: z.string().trim().max(1000),
    contactName: z.string().trim().max(100),
    contactPhone: z.string().trim().max(30),
  }),
  presentation: invitationPresentationSchema,
});

export const invitationEventSchema = z.object({
  name: z.string().trim().min(1).max(100),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
  venueName: z.string().trim().min(1).max(150),
  address: z.string().trim().min(1).max(500),
  mapUrl: z.string().url().max(2048).nullable(),
});

export const invitationMediaSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["cover", "gallery"]),
  path: z.string().min(1).max(500),
  altText: z.string().trim().max(150),
  sortOrder: z.number().int().min(0),
});

export const invitationDocumentV2Schema = storedInvitationDraftV2Schema.extend({
  events: z.array(invitationEventSchema).min(1),
  media: z.array(invitationMediaSchema).max(11),
});

const legacyInvitationDocumentV1Schema = z.object({
  schemaVersion: z.literal(1),
  couple: z.object({
    partnerOneName: z.string().trim().min(1).max(100),
    partnerTwoName: z.string().trim().min(1).max(100),
  }),
  presentation: z.object({
    templateKey: z.literal("modern-minimal"),
    accent: z.enum(invitationAccentKeys),
    typography: z.enum(invitationTypographyKeys),
    sections: z.array(z.enum(["hero", "event"])),
  }),
  event: invitationEventSchema,
});

export type InvitationDocument = z.infer<typeof invitationDocumentV2Schema>;

export const invitationDocumentSchema = z
  .union([invitationDocumentV2Schema, legacyInvitationDocumentV1Schema])
  .transform((document): InvitationDocument => {
    if (document.schemaVersion === 2) return document;

    return invitationDocumentV2Schema.parse({
      schemaVersion: 2,
      couple: document.couple,
      content: {
        story: "",
        giftBankName: "",
        giftAccountNumber: "",
        giftAccountHolder: "",
        closingMessage: "",
        contactName: "",
        contactPhone: "",
      },
      presentation: {
        ...document.presentation,
        sections: document.presentation.sections.map((section) =>
          section === "event" ? "events" : section,
        ),
      },
      events: [document.event],
      media: [],
    });
  });

export type StoredInvitationDraft = z.infer<
  typeof storedInvitationDraftV2Schema
>;

export function createInvitationDocument(
  draft: unknown,
  events: unknown,
  media: unknown = [],
): InvitationDocument {
  return invitationDocumentV2Schema.parse({
    ...storedInvitationDraftV2Schema.parse(draft),
    events,
    media,
  });
}
