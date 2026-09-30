# Manifest validation rules

Source: `@usequeek/cli` `src/lib/app-manifest.ts` (repo:
`theme-tools-wt-app/packages/cli`). The CLI fails closed: unknown fields
are rejected, required fields throw.

## Required

- Top level: `slug`, `name`, `scopes` (non-empty list — "The scopes field
  is required (at least one)"; `app-manifest.ts:278-280`), `install_url`,
  `uninstall_url` (`AppManifest` type, `app-manifest.ts:28`).
- Known top-level tables: `listing`, `access`, `webhooks`, `app`,
  `settings`, `extensions`, `dashboard`, `dev` (`app-manifest.ts:39`).

## Extensions (`checkExtensions`, `app-manifest.ts:390-421`)

- `extensions` must be a table. Allowed keys ONLY: `proxy`, `blocks`,
  `merchant_page_url`, `nav` (`app-manifest.ts:394-395`) — anything else is
  an unknown-field error.
- `extensions.proxy.url` is required when `proxy` is present; allowed proxy
  keys ONLY: `url`, `subpath`, `share_customer_id`
  (`app-manifest.ts:401-406`).
- `extensions.blocks` must be a list of `[[extensions.blocks]]` tables
  (`app-manifest.ts:420-421`).

## Nav (`checkNav`, `app-manifest.ts`)

- `extensions.nav` must be a list of `[[extensions.nav]]` tables with
  exactly `label` + `path` — any other key is rejected.
- At most 10 items.
- `extensions.nav` requires `extensions.merchant_page_url` ("the menu lives
  inside the merchant page"), which must be a valid https URL.
- `label`: 1–40 characters, no control characters.
- `path`: a relative path starting with `/` — no `//`, no `\`, no `..`,
  no scheme, no encoded variants.
