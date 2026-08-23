import { expect, test } from "@playwright/test";

test("keeps public static pages within the beta navigation budget", async ({
  page,
}) => {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  const response = await page.goto("/", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Mulai undangan digital Anda." }),
  ).toBeVisible();
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd,
      transferredBytes: resources.reduce(
        (total, item) => total + item.transferSize,
        0,
      ),
    };
  });
  expect(metrics.domContentLoaded).toBeLessThan(8_000);
  expect(metrics.transferredBytes).toBeLessThan(2_000_000);
});
