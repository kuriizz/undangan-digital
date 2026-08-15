import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Masukkan alamat email yang valid.")
  .max(254, "Alamat email terlalu panjang.");

const password = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Nama tampilan wajib diisi.")
      .max(100, "Nama tampilan maksimal 100 karakter."),
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["passwordConfirmation"],
  });

export const emailSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({
    password,
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["passwordConfirmation"],
  });

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Nama tampilan wajib diisi.")
    .max(100, "Nama tampilan maksimal 100 karakter."),
});

export function firstValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data yang dikirim tidak valid.";
}
