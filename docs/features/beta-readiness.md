# Beta readiness runbook

This runbook covers the P2.4 checks that require a deployed environment or real
beta participants. Automated engineering gates remain defined in the repository
scripts and CI workflow.

## Deployment configuration

Configure separate preview and production values for the public Supabase URL
and publishable key, server-only Supabase service-role key, site URL, fingerprint
secret, and optional support email. Create a Sentry project and configure client
and server DSNs, environment, release, organization, project, and source-map
auth token. Never expose the service-role key or Sentry auth token to the
browser.

Before inviting beta users:

1. Trigger one controlled client error and one controlled server error, then
   confirm their release/environment and redacted payloads in Sentry.
2. Configure alert ownership and verify that a test alert reaches the maintainer.
3. Set Sentry event retention to the shortest practical beta period and confirm
   session replay is disabled.
4. Review the privacy and terms copy with the actual operator identity and
   support contact before public distribution.

## Production acceptance

Use Chrome Lighthouse mobile against a representative published invitation with
a cover, ten gallery images, long text, multiple events, map, gift, RSVP, and
approved wishes. Targets are Performance 85, Accessibility 90, Best Practices
90, and SEO 90. Record any exception with the URL, date, device/network profile,
score, cause, and owner.

Repeat the critical flow on at least one real Android device and one real iOS
device under a constrained mobile connection. Verify keyboard/focus behavior,
320 px layout, image loading, publish/unpublish behavior, personalized links,
RSVP feedback, wish moderation, report abuse, and account deletion.

Run the local recovery proof on a clean local stack:

```bash
npm run db:start
npm run db:reset
npm run db:restore:test
```

The restore script creates and removes only an isolated verification database.
Supabase-managed internal `realtime` and `vault` schemas are excluded; customer
application, auth, and storage schemas are restored.

## Beta cohort and evidence

Recruit 5–10 Indonesian couples who can complete onboarding, editing, preview,
publishing, sharing, RSVP review, and wish moderation without intensive support.
For every session record completion, assistance required, defects, confusing
copy, missing tasks, device/network, and severity.

Ask each couple:

- Which template and controls were sufficient, and what could not be achieved?
- Which customization tasks would justify an Advanced package?
- Would moving sections, choosing layout variants, and rearranging supported
  blocks solve the need without free-form positioning?
- At what one-time price would Easy and Advanced feel inexpensive, acceptable,
  expensive, and too expensive?
- Would they actually pay now, and what proof or feature is missing?

Treat stated interest separately from payment intent. Do not finalize package
names, prices, quotas, or the Advanced editor until evidence is summarized.

## Triage and exit

- Critical: data exposure, account takeover, irreversible cross-tenant loss, or
  complete critical-flow outage. Stop the beta until closed.
- High: critical flow fails without a reasonable workaround. Close before the
  Phase 2 gate.
- Medium/low: prioritize by frequency and impact; document deliberate deferral.

Phase 2 closes only when all MVP requirements have acceptance evidence,
production Lighthouse meets its targets or exceptions are documented, restore
is proven, no critical/high issue remains, and primary beta feedback is handled
or deliberately deferred with a reason.
