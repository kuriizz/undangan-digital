import "server-only";

import * as Sentry from "@sentry/nextjs";

import { logServerEvent } from "./logger";

export function reportOperationalError(
  event: string,
  error: unknown,
  context: Record<string, unknown> = {},
) {
  const errorType = error instanceof Error ? error.name : typeof error;
  const errorCode =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : undefined;
  logServerEvent("error", event, { ...context, errorType, errorCode });

  const safeError = new Error(event);
  if (error instanceof Error && error.stack) {
    safeError.stack = `${safeError.name}: ${event}\n${error.stack
      .split("\n")
      .slice(1)
      .join("\n")}`;
  }
  Sentry.captureException(safeError, {
    contexts: { operation: { event, errorType, errorCode, ...context } },
  });
}
