import { z } from "zod";

export const publicRsvpSchema = z
  .object({
    slug: z.string().min(3).max(60),
    name: z.string().trim().min(1, "Nama wajib diisi.").max(100),
    attendance: z.enum(["attending", "not_attending"]),
    partySize: z.coerce.number().int().min(0).max(10),
    note: z.string().trim().max(500, "Catatan maksimal 500 karakter."),
    idempotencyKey: z.string().uuid(),
  })
  .superRefine((input, context) => {
    if (input.attendance === "attending" && input.partySize < 1) {
      context.addIssue({
        code: "custom",
        path: ["partySize"],
        message: "Jumlah hadir minimal 1 orang.",
      });
    }

    if (input.attendance === "not_attending" && input.partySize !== 0) {
      context.addIssue({
        code: "custom",
        path: ["partySize"],
        message: "Jumlah hadir harus 0 jika tidak hadir.",
      });
    }
  });

export type PublicRsvpValues = {
  slug: string;
  name: string;
  attendance: string;
  partySize: string;
  note: string;
  idempotencyKey: string;
};
