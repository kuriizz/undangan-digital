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

  await page.getByRole("button", { name: "+ Tambah acara" }).click();
  await page.getByLabel("Nama acara").nth(1).fill("Resepsi");
  await page.getByLabel("Tanggal").nth(1).fill("2027-04-24");
  await page.getByLabel("Waktu", { exact: true }).nth(1).fill("12:00");
  await page.getByLabel("Nama lokasi").nth(1).fill("Gedung Bahagia Baru");
  await page.getByLabel("Alamat lengkap").nth(1).fill("Jakarta Selatan");
  await page
    .getByLabel("Cerita pasangan (opsional)")
    .fill("Kami bertemu dan tumbuh bersama di Jakarta.");
  await page.getByLabel("Nama bank atau dompet digital").fill("Bank Uji");
  await page.getByLabel("Nomor rekening").fill("1234567890");
  await page.getByLabel("Nama pemilik rekening").fill("Dewi");
  await page
    .getByLabel("Pesan penutup (opsional)")
    .fill("Terima kasih atas doa dan kehadiran Anda.");
  await page.getByLabel("Nama lokasi").first().fill("Gedung Bahagia Baru");
  await page.getByLabel("Warna aksen").selectOption("sage");
  await page.getByLabel("Gaya tipografi").selectOption("modern");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(
    page.getByText("Perubahan draft berhasil disimpan."),
  ).toBeVisible();

  await page.getByLabel("Unggah foto sampul").setInputFiles({
    name: "cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page
    .getByRole("button", { name: "Unggah", exact: true })
    .first()
    .click();
  await expect(page.getByText("Foto berhasil diunggah.")).toBeVisible();

  await page.getByLabel("Tambah foto galeri").setInputFiles({
    name: "gallery.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("Teks alternatif").nth(1).fill("Foto galeri uji");
  await page
    .getByRole("button", { name: "Unggah", exact: true })
    .nth(1)
    .click();
  const galleryImage = page.getByAltText("Foto galeri uji");
  await expect(galleryImage).toBeVisible();
  await galleryImage
    .locator("xpath=ancestor::article")
    .getByRole("button", { name: "Hapus" })
    .click();
  await expect(page.getByText("Foto berhasil dihapus.")).toBeVisible();
  await expect(galleryImage).toHaveCount(0);
  const ownerCoverPath = await page
    .getByAltText("Foto sampul")
    .getAttribute("src");
  const coverMediaId = ownerCoverPath?.split("/").at(-1);
  expect(coverMediaId).toBeTruthy();
  const publicMediaPath = `/media/${coverMediaId}`;
  expect((await page.request.get(publicMediaPath)).status()).toBe(404);

  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole("link", { name: "Lihat preview" }).click();
  const previewUrl = page.url();
  await expect(page.getByText("Mode preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dewi" })).toBeVisible();
  await expect(page.getByText("Gedung Bahagia Baru").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resepsi" })).toBeVisible();
  await expect(
    page.getByText("Kami bertemu dan tumbuh bersama di Jakarta."),
  ).toBeVisible();
  await expect(page.getByAltText("Foto sampul pasangan")).toBeVisible();
  await expect(page).toHaveTitle(`Preview Dewi & Rizky | UndanganDigital`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("button", { name: "Terbitkan" }).click();
  await expect(page.getByText("Undangan berhasil diterbitkan.")).toBeVisible();
  await expect(page.getByText(`/i/${slug}`)).toBeVisible();
  const publicPath = await page
    .getByRole("link", { name: "Buka undangan" })
    .getAttribute("href");
  expect(publicPath).toBe(`/i/${slug}`);

  await page.getByRole("button", { name: "Keluar" }).click();
  await page.goto(previewUrl);
  await expect(page).toHaveURL(/\/login\?error=/);

  await page.goto(publicPath!);
  await expect(page.getByRole("heading", { name: "Dewi" })).toBeVisible();
  await expect(page.getByText("Gedung Bahagia Baru").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resepsi" })).toBeVisible();
  await expect(page.getByText("Bank Uji")).toBeVisible();
  await expect(page.getByAltText("Foto sampul pasangan")).toBeVisible();
  await expect(page).toHaveTitle("Dewi & Rizky | Undangan Pernikahan");
  await page.getByLabel("Nama", { exact: true }).fill("Tamu E2E");
  await page.getByLabel("Kehadiran").selectOption("attending");
  await page.getByLabel("Jumlah hadir").fill("2");
  await page.getByLabel("Catatan (opsional)").fill("Kami akan hadir");
  await page.getByRole("button", { name: "Kirim RSVP" }).click();
  await expect(
    page.getByText("Terima kasih. RSVP Anda berhasil dikirim."),
  ).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill("rahasia-aman-123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Tamu E2E")).toBeVisible();
  await expect(
    page.getByText("Hadir · 2 orang", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit draft" }).click();
  await page.getByRole("link", { name: "Lihat preview" }).click();
  await page.getByRole("button", { name: "Nonaktifkan" }).click();
  await expect(
    page.getByText("Undangan berhasil dinonaktifkan."),
  ).toBeVisible();
  expect((await page.request.get(publicMediaPath)).status()).toBe(404);

  const unpublishedResponse = await page.goto(publicPath!);
  expect(unpublishedResponse?.status()).toBe(404);
});
