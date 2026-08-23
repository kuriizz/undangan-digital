import { randomUUID } from "node:crypto";

const sensitiveKeys =
  /authorization|cookie|email|name|note|password|phone|session|token|wish/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKeys.test(key) ? "[REDACTED]" : redact(item),
      ]),
    );
  }
  return value;
}

export function logServerEvent(
  level: "info" | "warn" | "error",
  event: string,
  context: Record<string, unknown> = {},
) {
  const safeContext = redact(context) as Record<string, unknown>;
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    correlationId: context.correlationId ?? randomUUID(),
    ...safeContext,
  });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
