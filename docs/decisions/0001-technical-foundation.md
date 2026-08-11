# ADR 0001: Technical foundation

- **Status:** Accepted
- **Date:** 2026-08-11
- **Milestone:** P0.2

## Decision

- Use the existing modular-monolith proposal: TypeScript, Next.js App Router,
  React, Tailwind CSS, Supabase, and Vercel.
- Use Node.js 22 and npm. The lockfile is the reproducible dependency source.
- Use Zod as the shared runtime schema-validation library.
- Use Vitest for unit and integration test orchestration and Playwright for
  browser end-to-end tests.
- When authentication is implemented, use the official Supabase SSR package
  with cookie-backed server sessions. Authorization remains enforced by server
  operations and PostgreSQL Row Level Security.

## Environments

- **Local:** Next.js runs from npm scripts. P0.4 will add Supabase CLI services
  and local migrations. Developer secrets live in ignored `.env.local` files.
- **Preview:** Vercel preview deployments use a dedicated non-production
  Supabase project and preview-only secrets.
- **Production:** Vercel production uses a separate production Supabase project
  and production-only secrets.

Secrets must not be shared across these environments. `.env.example` contains
only safe local placeholders.

## Consequences

The repository has one JavaScript package manager and one supported Node.js
major version. Database integration tests remain unavailable until P0.4 adds the
Supabase local workflow; monitoring remains a later Phase 0/beta decision.
