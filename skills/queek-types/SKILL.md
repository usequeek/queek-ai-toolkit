---
name: queek-types
description: "Keep Merchant API types current: regenerate from the live spec with gen:merchant (sanity-checked, diffable output) and re-run after every backend deploy. Freshness is manual — types never auto-update. Use when the Merchant API gains fields or a call returns untyped data."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek types

The Merchant API is additive under `v1` by POLICY (plan
`app-live-types-and-ai-toolkit.md` G1) — and the served spec's own
`info.description` states it verbatim ("Additive-only under v1 … A
breaking change ships as v2 alongside v1"). Types are generated in the
app from the live spec with `queek app codegen` (CLI 0.14.0) — never
bundled with the SDK. Freshness is a manual re-run, the same as
Shopify's `graphql-codegen` step.

- Codegen flow (the only supported path) → `cat references/codegen.md`
- Freshness rule (when to re-run, what pins what) → `cat references/freshness.md`
