# ADR 0003: MVP product baseline

- **Status:** Accepted
- **Date:** 2026-08-11
- **Milestone:** P0.1

## Audience and positioning

The initial product serves couples in Indonesia who want an affordable,
self-service digital wedding invitation. The MVP supports one invitation per
account and does not introduce vendor/reseller workflows.

## RSVP and wishes

- A personalized guest link identifies one guest record. A valid repeat
  submission updates that guest's RSVP while the invitation is published.
- A general link accepts a new response. Names are not treated as unique and are
  not used for deduplication. Transport retries must still be idempotent and the
  public endpoint must be rate-limited.
- Wishes start in a pending state and appear publicly only after owner approval.

## Media, retention, and lifetime

- One cover image and at most ten gallery images are allowed.
- Each file is at most 5 MB and must be JPEG, PNG, or WebP.
- Invitations do not expire automatically during the beta period.
- Deleted active data is removed from the application immediately and must be
  purged from retained copies within 30 days.

## Slugs

- Slugs contain lowercase ASCII letters, digits, and hyphens, with a length of
  3-60 characters. Normalization trims and collapses hyphens.
- Reserved values include `admin`, `api`, `dashboard`, `help`, `i`, `login`,
  `privacy`, `register`, `support`, `terms`, and `www`.
- A former slug is permanently tombstoned or redirected to the same invitation;
  it can never be assigned to another owner.

## Beta template directions

The first three visual directions are Modern Minimal, Elegant Floral, and
Nusantara Contemporary. These are directions for later template work, not
authorization to build templates during Phase 0.
