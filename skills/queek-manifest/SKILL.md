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

The validator (`@usequeek/cli` `src/lib/app-manifest.ts`) fails closed on
unknown fields: if a key is not in the references, the CLI rejects it. Do
not invent keys.
