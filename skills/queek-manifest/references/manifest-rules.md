# Manifest validation rules

Sources: `@usequeek/cli` `src/lib/app-manifest.ts` (repo:
`theme-tools-wt-app/packages/cli`) and `queek_backend`
`app/Services/Apps/AppManifestValidator.php` (`topLevelKeys()`,
`rejectUnknown` — on `origin/master`). Both validators fail closed:
unknown fields are rejected, required fields throw.

## Top-level TOML keys (all 16 — `TOP_LEVEL_TOML_KEYS`, `app-manifest.ts:37-40`)

`slug`, `handle`, `name`, `version` (semver), `distribution`, `icon`
(`ICON_RE` — lowercase/digits/`_`/`-`), `developer`, `category`,
`listing`, `access`, `webhooks`, `app`, `settings`, `extensions`,
`dashboard`, `dev`.

## Required

- `slug` (matches `SLUG_RE`), `name`, `scopes` (non-empty list — "The
  scopes field is required (at least one)"; `app-manifest.ts:278-280`),
  `install_url`, `uninstall_url` (`AppManifest` type, `app-manifest.ts:28`).
- Manifest key inventory must never contain anything that smells like a
  secret (`secretProblem`, `app-manifest.ts:61`): secrets never live in the
  toml.

## Server-side keys and the `demo_url` / `video_url` gap

- The backend accepts 27 top-level keys (`AppManifestValidator::topLevelKeys()`):
  the flattened manifest shape (`MANIFEST_KEYS` in the CLI lists 25) PLUS
  `demo_url` and `video_url` (rules `nullable|string|max:2048`;
  `video_url` must be a YouTube or Vimeo URL;
  `AppManifestValidator.php:130-131,332-341,371-372`).
- GAP (30/9/26): the CLI's `MANIFEST_KEYS` (25) and `TOP_LEVEL_TOML_KEYS`
  (16) do NOT include `demo_url` / `video_url`, so `queek app deploy`
  rejects what the backend and the review checklist (`demo_presence` /
  `demo_host`) accept. Until the CLI is updated, set these two keys via the
  backend path, not the toml.

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
