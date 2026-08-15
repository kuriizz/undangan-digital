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

test("owner creates and updates one invitation draft", async ({ page }) => {
  const testRun = Date.now();
  const email = `invitation-${testRun}@example.test`;
  const slug = `dewi-rizky-${testRun}`;

  await page.goto("/register");
  await page.getByLabel("Nama tampilan").fill("Pemilik Undangan");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill("rahasia-aman-123");
  await page.getByLabel("Ulangi kata sandi").fill("rahasia-aman-123");
  await page.getByRole("button", { name: "Daftar" }).click();
  await page.getByLabel("Nama tampilan").fill("Pemilik Undangan");
  await page.getByRole("button", { name: "Simpan profil" }).click();

  await page.getByRole("link", { name: "Buat undangan" }).click();
  await page.getByLabel("Slug undangan").fill(`Dewi & Rizky ${testRun}`);
  await page.getByLabel("Nama pasangan pertama").fill("Dewi");
  await page.getByLabel("Nama pasangan kedua").fill("Rizky");
  await page.getByLabel("Nama acara").fill("Akad nikah");
  await page.getByLabel("Tanggal").fill("2027-04-24");
  await page.getByLabel("Waktu", { exact: true }).fill("09:30");
  await page.getByLabel("Zona waktu").selectOption("Asia/Jakarta");
  await page.getByLabel("Nama lokasi").fill("Gedung Bahagia");
  await page.getByLabel("Alamat lengkap").fill("Jakarta Selatan");
  await page.getByRole("button", { name: "Buat draft undangan" }).click();

  await expect(page).toHaveURL(/\/dashboard\/invitations\/.+\/content/);
  await expect(page.getByText("Draft undangan berhasil dibuat.")).toBeVisible();
  await expect(page.getByLabel("Slug undangan")).toHaveValue(slug);

  await page.getByLabel("Nama lokasi").fill("Gedung Bahagia Baru");
  await page.getByLabel("Warna aksen").selectOption("sage");
  await page.getByLabel("Gaya tipografi").selectOption("modern");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(
    page.getByText("Perubahan draft berhasil disimpan."),
  ).toBeVisible();

  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole("link", { name: "Lihat preview" }).click();
  const previewUrl = page.url();
  await expect(page.getByText("Mode preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dewi" })).toBeVisible();
  await expect(page.getByText("Gedung Bahagia Baru")).toBeVisible();
  await expect(page).toHaveTitle(`Preview Dewi & Rizky | UndanganDigital`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("link", { name: "Kembali mengedit" }).click();
  await page.getByRole("link", { name: "Kembali ke dashboard" }).click();
  await expect(page.getByText(`/i/${slug}`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit draft" })).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await page.goto(previewUrl);
  await expect(page).toHaveURL(/\/login\?error=/);
});
