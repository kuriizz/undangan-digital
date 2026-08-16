import { z } from "zod";

import {
  invitationAccentKeys,
  invitationSectionKeys,
  invitationTypographyKeys,
} from "./content";

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "dashboard",
  "help",
  "i",
  "login",
  "privacy",
  "register",
  "support",
  "terms",
  "www",
] as const;

const TIMEZONE_OFFSETS = {
  "Asia/Jakarta": 7,
  "Asia/Makassar": 8,
  "Asia/Jayapura": 9,
} as const;

export const invitationTimezones = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
] as const;

export function normalizeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const invitationSlugSchema = z
  .string()
  .transform(normalizeSlug)
  .pipe(
    z
      .string()
      .min(3, "Slug minimal 3 karakter.")
      .max(60, "Slug maksimal 60 karakter.")
      .regex(
        /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
        "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
      )
      .refine(
        (slug) => !RESERVED_SLUGS.includes(slug as never),
        "Slug tersebut digunakan oleh sistem. Pilih slug lain.",
      ),
  );

const trimmedText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(maximum, `${label} maksimal ${maximum} karakter.`);

const optionalText = (label: string, maximum: number) =>
  z.string().trim().max(maximum, `${label} maksimal ${maximum} karakter.`);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal acara tidak valid.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
    );
  }, "Tanggal acara tidak valid.");

export const invitationEventEditorSchema = z.object({
  name: trimmedText("Nama acara", 100),
  date: dateSchema,
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Waktu acara tidak valid."),
  timezone: z.enum(invitationTimezones),
  venueName: trimmedText("Nama lokasi", 150),
  address: trimmedText("Alamat", 500),
  mapUrl: z
    .string()
    .trim()
    .max(2048, "Tautan peta terlalu panjang.")
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      "Tautan peta harus berupa URL yang valid.",
    ),
});

function jsonField<T extends z.ZodType>(schema: T, message: string) {
  return z.string().transform((value, context): z.infer<T> => {
    try {
      return schema.parse(JSON.parse(value));
    } catch {
      context.addIssue({ code: "custom", message });
      return z.NEVER;
    }
  });
}

const eventsSchema = z
  .array(invitationEventEditorSchema)
  .min(1, "Minimal satu acara.");
const sectionsSchema = z
  .array(z.enum(invitationSectionKeys))
  .min(1)
  .max(invitationSectionKeys.length)
  .refine((sections) => new Set(sections).size === sections.length)
  .refine((sections) => sections.includes("hero"), "Sampul wajib ditampilkan.");

export const invitationDraftSchema = z.object({
  invitationId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  slug: invitationSlugSchema,
  partnerOneName: trimmedText("Nama pasangan pertama", 100),
  partnerTwoName: trimmedText("Nama pasangan kedua", 100),
  story: optionalText("Cerita", 2000),
  giftBankName: optionalText("Nama bank", 100),
  giftAccountNumber: optionalText("Nomor rekening", 100),
  giftAccountHolder: optionalText("Nama pemilik rekening", 100),
  closingMessage: optionalText("Pesan penutup", 1000),
  contactName: optionalText("Nama kontak", 100),
  contactPhone: optionalText("Nomor kontak", 30).refine(
    (value) => value === "" || /^[+0-9][0-9\s-]*$/.test(value),
    "Nomor kontak tidak valid.",
  ),
  eventsJson: jsonField(eventsSchema, "Data rangkaian acara tidak valid."),
  sectionsJson: jsonField(sectionsSchema, "Urutan section tidak valid."),
  accent: z.enum(invitationAccentKeys),
  typography: z.enum(invitationTypographyKeys),
});

export type InvitationEventEditor = z.infer<typeof invitationEventEditorSchema>;
export type InvitationDraftInput = z.infer<typeof invitationDraftSchema>;

export type InvitationDraftValues = {
  invitationId: string;
  slug: string;
  partnerOneName: string;
  partnerTwoName: string;
  story: string;
  giftBankName: string;
  giftAccountNumber: string;
  giftAccountHolder: string;
  closingMessage: string;
  contactName: string;
  contactPhone: string;
  eventsJson: string;
  sectionsJson: string;
  accent: string;
  typography: string;
};

export function toEventTimestamp(event: InvitationEventEditor) {
  const [year, month, day] = event.date.split("-").map(Number);
  const [hour, minute] = event.time.split(":").map(Number);
  const offset = TIMEZONE_OFFSETS[event.timezone];

  return new Date(
    Date.UTC(year, month - 1, day, hour - offset, minute),
  ).toISOString();
}

export function toRelationalEvents(input: InvitationDraftInput) {
  return input.eventsJson.map((event, sortOrder) => ({
    sortOrder,
    name: event.name,
    startsAt: toEventTimestamp(event),
    timezone: event.timezone,
    venueName: event.venueName,
    address: event.address,
    mapUrl: event.mapUrl || null,
  }));
}

export function toDraftContent(input: InvitationDraftInput) {
  return {
    schemaVersion: 2,
    couple: {
      partnerOneName: input.partnerOneName,
      partnerTwoName: input.partnerTwoName,
    },
    content: {
      story: input.story,
      giftBankName: input.giftBankName,
      giftAccountNumber: input.giftAccountNumber,
      giftAccountHolder: input.giftAccountHolder,
      closingMessage: input.closingMessage,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
    },
    presentation: {
      templateKey: "modern-minimal" as const,
      accent: input.accent,
      typography: input.typography,
      sections: input.sectionsJson,
    },
  };
}
