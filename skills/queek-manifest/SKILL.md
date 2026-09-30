---
name: queek-manifest
description: "Author and validate queek.app.toml: required tables and fields, access scopes, webhooks, app URLs, settings, and extensions (proxy, blocks, merchant_page_url, nav). Use when creating or editing an app manifest, adding scopes, nav items, or storefront blocks."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek app manifest

The manifest is the local source of truth for `queek app dev` /
`queek app deploy`. Secrets never live here. Read both reference files
before writing a manifest:

- Field-by-field shape with a real example → `cat references/manifest-shape.md`
- Validation rules the CLI enforces → `cat references/manifest-rules.md`

The CLI validator (`@usequeek/cli` `src/lib/app-manifest.ts`) fails closed
on unknown fields — `Unknown field 'x' in manifest.` — and so does the
backend (`AppManifestValidator::rejectUnknown`). `references/manifest-rules.md`
lists every accepted key for both. Do not invent keys; if a key you need is
not listed there, it does not exist.
