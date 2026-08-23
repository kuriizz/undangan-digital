# ADR 0005: Beta observability and trusted public request boundary

- **Status:** Accepted
- **Date:** 2026-08-23
- **Milestone:** P2.4

## Context

The beta needs actionable frontend and server error visibility without sending
guest content, personal tokens, sessions, or other unnecessary personal data to
an observability provider. Public Supabase RPCs also allowed callers holding the
browser publishable key to supply arbitrary rate-limit fingerprints, weakening
application-level abuse controls.

## Decision

Use Sentry Cloud through the MIT-licensed `@sentry/nextjs` SDK. The integration
is opt-in through environment variables, disables default PII and session
replay, removes request payloads, cookies, headers, query strings, users, and
console breadcrumbs, and uses low trace sampling. Source maps upload only when
deployment credentials are present. Server logs remain structured JSON with
correlation IDs and recursive key-based redaction.

Route public database reads and mutations through a trusted Next.js server
client. The Supabase service-role key remains server-only. Anonymous roles may
not execute RSVP, personalized lookup, published invitation, public wish,
published media, or abuse-report RPCs directly. Server validation, durable
database rate limits, idempotency, and honeypots remain mandatory; trusted
access does not replace narrow RPC contracts.

Use PostgreSQL for beta rate limiting instead of adding Redis. Use a simple
honeypot before considering an external CAPTCHA. Abuse reports remain available
only to trusted service context and survive deletion of the reported invitation
for their defined retention period.

## Consequences

- Deployments require a server-only Supabase service key in addition to the
  browser publishable key.
- Sentry is inactive locally and in CI unless a DSN is explicitly configured.
- Public pages depend on the Next.js server boundary instead of exposing the
  underlying RPC contract to browsers.
- Rate-limit state is durable but intentionally sized for beta traffic; a
  distributed cache can be reconsidered only from production evidence.
- Vendor account creation, DSN configuration, alert routing, and a production
  test event remain deployment tasks.
