# AGENTS.md

## Purpose

This repository contains the UndanganDigital web application. Work incrementally, keep changes reviewable, and do not expand product scope without explicit approval.

## Documentation authority

Read only the documents relevant to the task, using this order when guidance overlaps:

1. `AGENTS.md` — repository working rules and documentation routing.
2. `docs/PRD.md` — product requirements, scope, and acceptance criteria.
3. `docs/ARCHITECTURE.md` — approved technical boundaries and system design.
4. `docs/IMPLEMENTATION_PLAN.md` — delivery order and current phase checklist.
5. Feature-specific documentation, when added under `docs/features/`.

Do not duplicate product requirements in code comments or other documents. Reference their requirement IDs instead.

## Current state

- The project is in Phase 0: discovery and technical foundation.
- The proposed stack is TypeScript, Next.js App Router, PostgreSQL/Supabase, and Tailwind CSS.
- Treat architecture choices marked **Proposed** or **Open** as requiring confirmation before they become costly to reverse.
- Payment, automated WhatsApp messaging, custom domains, QR check-in, AI features, and a free-form drag-and-drop editor are outside the MVP.

## Working rules

- Inspect existing files and `git status` before making changes.
- Preserve unrelated work and make the smallest safe change that completes the selected requirement IDs.
- Implement one vertical slice or tightly related requirement group at a time.
- Do not introduce microservices, queues, or infrastructure that the current phase does not require.
- Keep product data access tenant-safe. Authorization must be enforced on the server/database, not only in UI code.
- Never expose the Supabase service-role key or other secrets to browser code, logs, fixtures, or source control.
- Store database changes as versioned migrations. Every exposed table must have explicit grants and Row Level Security policies.
- Validate untrusted input on the server. Treat public RSVP, wishes, guest tokens, slugs, and uploads as abuse-sensitive surfaces.
- Use Indonesian for user-facing copy unless a requirement specifies otherwise. Use English for code identifiers and technical documentation unless consistency calls for Indonesian.
- Do not modify this file or other governance documents unless the task explicitly requires it.

## Expected project structure

Once the application is scaffolded, prefer this shape unless the architecture document is deliberately updated:

```text
src/
├── app/          # routes, layouts, route handlers, server actions
├── components/   # shared UI and design-system components
├── features/     # product modules such as invitations and RSVP
├── lib/          # infrastructure clients, validation, utilities
└── types/        # shared types when they do not belong to a feature
supabase/
└── migrations/   # schema, grants, RLS policies, database functions
tests/
├── integration/
└── e2e/
```

Keep feature-specific components, schemas, server operations, and tests close to their feature. Avoid a generic `utils` dumping ground.

## Validation

The exact package commands must be established during scaffolding and then reflected in `README.md`. The baseline quality gate is:

1. Formatting check.
2. Lint.
3. Typecheck.
4. Unit and integration tests relevant to the change.
5. End-to-end tests for affected critical flows.
6. Production build for changes affecting routing, rendering, or deployment.

Until scripts exist, do not claim these checks passed. State clearly which checks were unavailable.

Critical flows are:

- Sign up/sign in and owner data isolation.
- Create, preview, publish, and unpublish an invitation.
- Open a published invitation anonymously.
- Submit an RSVP and view it only as the owner.

## Completion report

When handing work back, lead with the outcome and briefly report:

- Requirement IDs completed.
- Files or behavior changed.
- Validation run and its result.
- Checks not run and why.
- Remaining risk, assumption, or decision needed.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
