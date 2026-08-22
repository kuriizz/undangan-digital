# ADR 0004: Product packaging and constrained advanced editor

- **Status:** Accepted
- **Date:** 2026-08-23
- **Milestone:** Phase 3 planning

## Context

The MVP uses curated templates with controlled color, typography, section
visibility, and section ordering. A future paid offering needs a meaningful
customization benefit without turning the product into a free-form design tool
that is difficult to keep responsive, accessible, and compatible across
template versions.

Package names, prices, and willingness to pay have not yet been validated with
beta users. Building the advanced editor before completing beta readiness would
expand scope before the core guest and safety workflows are proven.

## Decision

Complete P2.3 and P2.4 before implementing package enforcement or an advanced
editor. During the 5-10 couple beta, collect structured evidence about interest,
desired customization tasks, price sensitivity, and willingness to pay for two
candidate experiences:

- **Easy:** choose a curated template and use its supported presentation
  controls while the template owns the responsive internal layout.
- **Advanced:** use a constrained editor to reorder sections, select section
  variants, rearrange blocks within supported slots, and adjust a limited set of
  alignment, spacing, background, and framing options.

The Advanced experience belongs to Phase 3 and is implemented only after the
beta evidence supports it. Final package names, prices, quotas, and exact feature
allocation remain product decisions to close from that evidence.

The Advanced editor is not a coordinate-based canvas. It will not accept
arbitrary HTML, CSS, scripts, or unrestricted element positioning. Layout data
uses a versioned, semantic schema with stable section and block identifiers,
validated settings, safe defaults, and backward normalization for existing
published invitations. Template changes must map supported semantic blocks or
fall back explicitly to a safe template default.

Package entitlement is enforced in trusted server and database boundaries and
kept separate from presentation components. Hiding controls in the browser is
not an authorization boundary. Draft and published snapshot behavior remains
unchanged.

## Consequences

- P2.3 guest and wish workflows and P2.4 hardening remain the immediate delivery
  priorities.
- The current template renderer and content model remain sufficient for the
  beta; no speculative schema migration is introduced in Phase 2.
- Phase 3 must design versioned layout configuration, entitlement enforcement,
  accessible drag-and-drop interactions, undo/redo, responsive preview, and
  compatibility tests before enabling Advanced editing.
- A free-form Canva-like editor remains outside the committed roadmap.
