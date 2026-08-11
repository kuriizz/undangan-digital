import { expect, test } from "@playwright/test";

test("shows the Phase 0 foundation page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Fondasi teknis siap dikembangkan.",
    }),
  ).toBeVisible();
});
