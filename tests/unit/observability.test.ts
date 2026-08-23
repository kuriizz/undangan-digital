import { describe, expect, it, vi } from "vitest";

import { logServerEvent } from "@/lib/observability/logger";
import {
  redactSentryBreadcrumb,
  redactSentryEvent,
} from "@/lib/observability/sentry-options";

describe("privacy-first observability", () => {
  it("removes request and user data from Sentry events", () => {
    const event = redactSentryEvent({
      type: undefined,
      exception: {
        values: [{ type: "DatabaseError", value: "private value" }],
      },
      message: "private error message",
      user: { email: "private@example.test" },
      request: {
        url: "https://example.test/i/ayu-bima?to=secret-token",
        headers: { cookie: "secret" },
        data: "private wish",
      },
      extra: { token: "secret" },
    });
    expect(event.user).toBeUndefined();
    expect(event.extra).toBeUndefined();
    expect(event.message).toBeUndefined();
    expect(event.exception?.values?.[0]?.value).toBe("DatabaseError");
    expect(event.request?.url).toBe("https://example.test/i/ayu-bima");
    expect(event.request?.headers).toBeUndefined();
    expect(event.request?.data).toBeUndefined();
  });

  it("drops console breadcrumbs and their arbitrary data", () => {
    expect(redactSentryBreadcrumb({ category: "console" })).toBeNull();
    expect(
      redactSentryBreadcrumb({
        category: "navigation",
        data: { token: "secret" },
      })?.data,
    ).toBeUndefined();
  });

  it("redacts sensitive structured log fields", () => {
    const output = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    logServerEvent("error", "test-event", {
      guestToken: "secret",
      safeCount: 2,
    });
    expect(output).toHaveBeenCalledOnce();
    const entry = JSON.parse(String(output.mock.calls[0]?.[0]));
    expect(entry.guestToken).toBe("[REDACTED]");
    expect(entry.safeCount).toBe(2);
    output.mockRestore();
  });
});
