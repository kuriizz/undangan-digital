import { expect, test } from "@playwright/test";

test("anonymous owner completes the authentication lifecycle", async ({
  page,
}) => {
  const email = `owner-${Date.now()}@example.test`;
  const initialPassword = "rahasia-awal-123";
  const updatedPassword = "rahasia-baru-456";

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?error=/);

  await page.goto("/register");
  await page.getByLabel("Nama tampilan").fill("Pasangan Uji");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(initialPassword);
  await page.getByLabel("Ulangi kata sandi").fill(initialPassword);
  await page.getByRole("button", { name: "Daftar" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await expect(
    page.getByRole("heading", { name: "Lengkapi profil" }),
  ).toBeVisible();
  await page.getByLabel("Nama tampilan").fill("Pasangan E2E");
  await page.getByRole("button", { name: "Simpan profil" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Halo, Pasangan E2E" }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await page.goto("/update-password");
  await page
    .getByLabel("Kata sandi baru", { exact: true })
    .fill(updatedPassword);
  await page.getByLabel("Ulangi kata sandi baru").fill(updatedPassword);
  await page.getByRole("button", { name: "Simpan kata sandi" }).click();
  await expect(page.getByText("Kata sandi berhasil diperbarui.")).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill(updatedPassword);
  await page.getByRole("button", { name: "Masuk" }).click();

  await expect(
    page.getByRole("heading", { name: "Halo, Pasangan E2E" }),
  ).toBeVisible();
});

test("password reset request does not disclose account existence", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(`unknown-${Date.now()}@example.test`);
  await page.getByRole("button", { name: "Kirim tautan reset" }).click();

  await expect(
    page.getByText(
      "Jika akun terdaftar, tautan reset kata sandi telah dikirim.",
    ),
  ).toBeVisible();
});
