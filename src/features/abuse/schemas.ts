import { z } from "zod";

export const abuseReportSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,60}$/, "Slug undangan tidak valid."),
  category: z.enum(["privacy", "fraud", "harassment", "copyright", "other"]),
  details: z
    .string()
    .trim()
    .min(10, "Jelaskan laporan minimal 10 karakter.")
    .max(1000, "Laporan maksimal 1.000 karakter."),
  contactEmail: z
    .union([
      z.literal(""),
      z.string().trim().email("Alamat email tidak valid.").max(254),
    ])
    .default(""),
  website: z.literal(""),
  idempotencyKey: z.string().uuid(),
});

export type AbuseReportValues = z.input<typeof abuseReportSchema>;
