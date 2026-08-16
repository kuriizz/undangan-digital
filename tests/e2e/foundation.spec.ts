import { expect, test } from "@playwright/test";

test("shows the product landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Mulai undangan digital Anda.",
    }),
  ).toBeVisible();
});

test("shows completed milestones and separates the roadmap", async ({
  page,
}) => {
  await page.goto("/changelog");

  await expect(
    page.getByRole("heading", { name: "Changelog UndanganDigital" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Draft undangan" }),
  ).toBeVisible();
  await expect(page.getByText("9 milestone tervalidasi")).toBeVisible();
  await expect(
    page.getByText(
      "Vertical slice login hingga RSVP telah tervalidasi, termasuk smoke test pada perangkat nyata tanpa issue kritis atau tinggi.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Arah berikutnya" }),
  ).toBeVisible();
});
