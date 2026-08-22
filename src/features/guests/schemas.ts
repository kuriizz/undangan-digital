import { z } from "zod";

export const guestInputSchema = z.object({
  invitationId: z.string().uuid(),
  guestId: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Nama tamu wajib diisi.").max(100),
  partyLimit: z.coerce.number().int().min(1).max(10),
});

export const guestIdSchema = z.object({
  invitationId: z.string().uuid(),
  guestId: z.string().uuid(),
});
