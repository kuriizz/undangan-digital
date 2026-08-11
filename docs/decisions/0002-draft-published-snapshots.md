# ADR 0002: Draft and published snapshots

- **Status:** Accepted
- **Date:** 2026-08-11
- **Milestone:** P0.2
- **Requirements:** INV-06, INV-08, PUB-02

## Decision

Store flexible render content as versioned JSONB snapshots on the invitation,
while keeping searchable and constrained data relational. The invitation model
will track at least a draft revision, `draft_content`, `published_content`, the
published revision, and `published_at`.

Publishing will:

1. validate the complete draft with a versioned Zod schema on the server;
2. call a PostgreSQL function with the expected draft revision;
3. lock and verify the invitation belongs to the authenticated owner;
4. atomically copy the validated draft to the published snapshot and update its
   revision and timestamp.

The public renderer reads only `published_content`. Unpublishing changes
availability without deleting either snapshot. Migration and RLS implementation
belong to P0.4 and the publish operation belongs to Phase 1.

## Spike result

The P0.2 unit spike validates a small versioned content shape, creates a detached
snapshot, and proves later draft mutation does not alter published content. It
also proves invalid content is rejected before snapshot creation.

## Consequences

This preserves INV-06 without introducing a general event-sourcing or version
history system. Schema migrations must support old published schema versions
once invitations exist in production.
