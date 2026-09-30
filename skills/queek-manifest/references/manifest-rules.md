# Manifest validation rules

Sources: `@usequeek/cli` `src/lib/app-manifest.ts` (repo:
`theme-tools-wt-app/packages/cli`, CLI `feat/queek-app` branch at `39b0bb6`)
and `queek_backend` `app/Services/Apps/AppManifestValidator.php`
(`topLevelKeys()`, `rejectUnknown` — on `origin/master`). Both validators
fail closed: unknown fields are rejected, required fields throw.

## Top-level TOML keys (all 16 — `TOP_LEVEL_TOML_KEYS`)

`slug`, `handle`, `name`, `version` (semver), `distribution`, `icon`
(`ICON_RE` — lowercase/digits/`_`/`-`), `developer`, `category`,
`listing`, `access`, `webhooks`, `app`, `settings`, `extensions`,
`dashboard`, `dev`.

## Required

- `slug` (matches `SLUG_RE`), `name`, `scopes` (non-empty list — "The
  scopes field is required (at least one)"), `install_url`,
  `uninstall_url` (`AppManifest` type).
- Manifest key inventory must never contain anything that smells like a
  secret (`secretProblem`): secrets never live in the toml.

## Server-side keys and the `demo_url` / `video_url` gap (CLOSED)

- The backend accepts 27 top-level keys
  (`AppManifestValidator::topLevelKeys()` on `origin/master`): the
  flattened manifest shape (`MANIFEST_KEYS` in the CLI lists 27) including
  `demo_url` and `video_url` (rules `nullable|string|max:2048`;
  `video_url` must be a YouTube or Vimeo URL — backend
  `isAllowedVideoHost`, same error text as the CLI).
- GAP (closed 30/9/26 in CLI commit `6490a4d`, merged at `39b0bb6`): the
  CLI's `MANIFEST_KEYS` listed 25 and rejected the two keys; it now lists
  all 27, and the `[listing]` path accepts and validates them
  (`checkCappedUrl` on both, `isAllowedVideoHost` on `video_url` with the
  same YouTube-or-Vimeo error text, mirroring the server-side
  `assertAppUrl` guard). Set them under `[listing]` in the toml — the
  flattened manifest carries them through.
- TOML-level vs manifest-level is a deliberate distinction, not a second
  gap: `TOP_LEVEL_TOML_KEYS` (16) still has no `demo_url` / `video_url`
  because they live under `[listing]`, not at the top level. Only the
  flattened manifest shape (`MANIFEST_KEYS`, 27) carries them.

## Extensions (`checkExtensions`)

- `extensions` must be a table. Allowed keys ONLY: `proxy`, `blocks`,
  `merchant_page_url`, `nav` — anything else is an unknown-field error
  (`unknownField`).
- `extensions.proxy.url` is required when `proxy` is present; allowed proxy
  keys ONLY: `url`, `subpath`, `share_customer_id`.
- `extensions.blocks` must be a list of `[[extensions.blocks]]` tables.

## Nav (`checkNav`)

- `extensions.nav` must be a list of `[[extensions.nav]]` tables with
  exactly `label` + `path` — any other key is rejected.
- At most 10 items.
- `extensions.nav` requires `extensions.merchant_page_url` ("the menu lives
  inside the merchant page"), which must be a valid https URL.
- `label`: 1–40 characters, no control characters.
- `path`: a relative path starting with `/` — no `//`, no `\`, no `..`,
  no scheme, no encoded variants.
