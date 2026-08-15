import { expect, test } from "@playwright/test";

test("shows the product landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Mulai undangan digital Anda.",
    }),
  ).toBeVisible();
});
