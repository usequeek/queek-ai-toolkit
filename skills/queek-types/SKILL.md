---
name: queek-types
description: "Keep Merchant API types current: regenerate from the live spec with gen:merchant (sanity-checked, diffable output) and re-run after every backend deploy. Freshness is manual — types never auto-update. Use when the Merchant API gains fields or a call returns untyped data."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek types

The Merchant API is additive under `v1` by POLICY (plan
`app-live-types-and-ai-toolkit.md` G1/B2 — the served spec carries no
additive/v2-alongside text yet; B2 is unlanded). Types are generated in the
app from the live spec — never bundled with the SDK. Freshness is a manual
re-run, the same as Shopify's `graphql-codegen` step.

- Codegen flow (the only supported path) → `cat references/codegen.md`
- Freshness rule (when to re-run, what pins what) → `cat references/freshness.md`
