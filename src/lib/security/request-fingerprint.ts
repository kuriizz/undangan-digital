import "server-only";

import { createHmac } from "node:crypto";

import { headers } from "next/headers";

export async function createRequestFingerprint() {
  const secret = process.env.RSVP_FINGERPRINT_SECRET;
  if (!secret || secret.length < 32) return null;

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0];
  const address = forwardedFor?.trim() || "unknown-address";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown-agent";
  const language = requestHeaders.get("accept-language") ?? "unknown-language";

  return createHmac("sha256", secret)
    .update(`${address}\n${userAgent}\n${language}`)
    .digest("hex");
}
