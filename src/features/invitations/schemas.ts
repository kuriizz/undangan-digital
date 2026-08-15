import { z } from "zod";

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

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal acara tidak valid.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
    );
  }, "Tanggal acara tidak valid.");

export const invitationDraftSchema = z.object({
  invitationId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  slug: invitationSlugSchema,
  partnerOneName: trimmedText("Nama pasangan pertama", 100),
  partnerTwoName: trimmedText("Nama pasangan kedua", 100),
  eventName: trimmedText("Nama acara", 100),
  eventDate: dateSchema,
  eventTime: z
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

export type InvitationDraftInput = z.infer<typeof invitationDraftSchema>;
export type InvitationDraftValues = Record<
  keyof z.input<typeof invitationDraftSchema>,
  string
>;

export function toEventTimestamp(input: InvitationDraftInput) {
  const [year, month, day] = input.eventDate.split("-").map(Number);
  const [hour, minute] = input.eventTime.split(":").map(Number);
  const offset = TIMEZONE_OFFSETS[input.timezone];

  return new Date(
    Date.UTC(year, month - 1, day, hour - offset, minute),
  ).toISOString();
}

export function toDraftContent(input: InvitationDraftInput) {
  return {
    schemaVersion: 1,
    couple: {
      partnerOneName: input.partnerOneName,
      partnerTwoName: input.partnerTwoName,
    },
  };
}

export const storedCoupleSchema = z.object({
  schemaVersion: z.literal(1),
  couple: z.object({
    partnerOneName: z.string(),
    partnerTwoName: z.string(),
  }),
});
