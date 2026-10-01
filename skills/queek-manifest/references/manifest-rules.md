# Manifest validation rules

Sources: `@usequeek/cli` 0.14.0 `src/lib/app-manifest.ts` (repo:
`usequeek/theme-tools/packages/cli`) and the Queek API (docs.usequeek.com)
`app/Services/Apps/AppManifestValidator.php` (`topLevelKeys()`,
`rejectUnknown`). Both validators fail closed: unknown fields are
rejected, required fields throw.

## Top-level TOML keys (all 16 — `TOP_LEVEL_TOML_KEYS`)

`slug`, `handle`, `name`, `version` (semver), `distribution`, `icon`
(`ICON_RE` — lowercase/digits/`_`/`-`), `developer`, `category`,
`listing`, `access`, `webhooks`, `app`, `settings`, `extensions`,
`dashboard`, `dev`.

## Required

- `slug` (matches `SLUG_RE`), `name`, `scopes` (the field stays present
  but may be empty), `install_url`, `uninstall_url` (`AppManifest` type).
- Manifest key inventory must never contain anything that smells like a
  secret (`secretProblem`): secrets never live in the toml.

## Access (`[access]` → `scopes`, `optional_scopes`)

- `scopes`: required scopes, granted at install. `optional_scopes`:
  requested later at runtime, never granted at install — same
  grantable-scope rule, and the two lists must be disjoint (overlap is
  rejected on both sides). See the `queek-app` skill's `scopes.md` for the
  runtime side.
- A dashboard action's `scope` may come from either list.

## Flattened manifest keys (28 — the CLI/backend mirror)

`MANIFEST_KEYS` (CLI) and `AppManifestValidator::topLevelKeys()`
(backend) list the same 28 keys: `slug`, `name`, `description`, `icon`,
`developer`, `version`, `distribution`, `category`, `tagline`,
`description_long`, `highlights`, `logo_url`, `pricing`, `developer_url`,
`privacy_url`, `support_url`, `demo_url`, `video_url`, `scopes`,
`optional_scopes`, `webhook_topics`, `settings`, `install_url`,
`uninstall_url`, `settings_url`, `webhook_url`, `extensions`, `dashboard`.
`demo_url` and `video_url` are set under `[listing]` in the toml
(`checkCappedUrl` on both; `video_url` must be a YouTube or Vimeo URL —
`isAllowedVideoHost`, same error text both sides). TOML-level vs
manifest-level is deliberate: `TOP_LEVEL_TOML_KEYS` (16) has no
`demo_url` / `video_url` because they live under `[listing]`; only the
flattened manifest shape (28) carries them.

## Extensions (`checkExtensions`)

- `extensions` must be a table. Allowed keys ONLY: `proxy`, `blocks`,
  `merchant_page_url`, `nav` — anything else is an unknown-field error
  (`unknownField`).
- `extensions.proxy.url` is required when `proxy` is present; allowed proxy
  keys ONLY: `url`, `subpath`, `share_customer_id`.
- `extensions.blocks` must be a list of `[[extensions.blocks]]` tables.

## Dashboard (`checkDashboard`)

- `dashboard` accepts exactly `blocks`, `actions`, `print` — anything else
  is an unknown-field error. Caps mirror the backend: blocks ≤ 10,
  actions ≤ 10, print ≤ 5.
- An action's `scope` must be a declared scope from either tier (see
  Access above).

## Nav (`checkNav`)

- `extensions.nav` must be a list of `[[extensions.nav]]` tables with
  exactly `label` + `path` — any other key is rejected.
- At most 10 items.
- `extensions.nav` requires `extensions.merchant_page_url` ("the menu lives
  inside the merchant page"), which must be a valid https URL.
- `label`: 1–40 characters, no control characters.
- `path`: a relative path starting with `/` — no `//`, no `\`, no `..`,
  no scheme, no encoded variants.
