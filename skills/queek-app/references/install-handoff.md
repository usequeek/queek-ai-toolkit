# Install handoff

Sources (repo `app-sdk-wt-bridge`, SDK 0.5.1 at `b9b4332`): `src/install-handlers.ts`,
`src/handoff.ts`, `src/hono.ts`, `src/session.ts`, `src/server.ts`,
`src/app-auth.ts`, `src/tokens.ts`, `src/resync.ts`, `README.md` (sections
named in each bullet); CLI `src/commands/app/deploy.ts`
(repo `theme-tools-wt-app`). Symbols are the contract; line numbers drift.

## Order per request: verify first, then parse, then act

`src/install-handlers.ts` header comment: "verify signature (freshness
included) → parse the typed payload → atomically claim the header
`webhook-id` (a claimed id answers 409) → run the callback → 2xx". The
`guard()` function runs `verifyQueekSignatureDetailed` on the raw bytes +
headers before anything else; a bad signature is 401. The Standard Webhooks
headers ride on the APP signing secret (`whsec_…`, the `appSecret` option),
not on any per-installation secret.

A callback that throws (for example the store write failed) releases the
claim and answers non-2xx (`install_failed` / `uninstall_failed` /
`settings_failed`, status 500). Per the same header comment, Queek then
revokes the just-minted key and marks the install failed, so answer 2xx only
after the installation is durably stored.

## Handlers

- Layer 1 `handleInstallDelivery(input, { appSecret, store, onInstall?,
  onUninstall?, onSettings?, nowSeconds?, maxSkewSeconds? })` serves the
  signed install / uninstall / settings handoff from raw bytes + headers. It
  routes on the request path's trailing segment (`install` / `uninstall` /
  `settings`), so one shared options object serves all three routes; a
  non-POST is 405 `method_not_allowed`, an unknown segment 404
  `unknown_route`.
- Layer 2 `handleInstallRequest(request, options)` adapts `Request` →
  `Response` onto layer 1 (`src/install-handlers.ts`; `README.md` § Example
  (any framework)).
- Hono: `createInstallHandlers(options)` from `@usequeek/app-sdk/hono`
  mounts `POST /install`, `POST /uninstall`, `POST /settings` (`src/hono.ts`).
- Next.js App Router: one route file per handoff path calling
  `handleInstallRequest(request, installOptions)` with
  `installOptions = { appSecret: process.env.QUEEK_APP_SECRET!, store }`
  (`README.md` § Example (any framework)).
- Custom `onInstall`: build the record with `buildInstallationRecord(data)`
  so it persists exactly what the default handler would
  (`src/install-handlers.ts`).

## Envelope

The signed body envelope is `{ id, type, api_version: "v1", created_at,
data }` with `type` one of `app/installed` | `app/uninstalled` |
`app/settings_updated` | `app/resync` (`src/handoff.ts`: `INSTALL_EVENT`,
`UNINSTALL_EVENT`, `SETTINGS_EVENT`, `RESYNC_EVENT`, `HandoffEnvelope`).
`app/resync` carries the install-shaped `InstallData` (plus `secret_rotated`)
and is accepted by BOTH the `install` and `settings` handlers. On `settings`
it always takes the resync merge; on `install` it takes the resync merge
unless you pass a custom `onInstall`, in which case your callback receives it
(`src/install-handlers.ts` `installDelivery` / `settingsDelivery`).

`InstallData` fields: `installation {id, p_id}`, `store {id, p_id, name,
is_test}`, `api_base`, `scopes`, `settings`, `webhook_secret`,
`proxy_secret`, `embed_secret?`, `app_id?`, `webhook_url`, `webhook_topics`,
`secret_rotated?` (`src/handoff.ts`).

## Secrets

- No store-callable *token* crosses the handoff: the app mints short-lived
  installation tokens with its asymmetric app key (`acquireToken()`;
  `src/handoff.ts` `InstallData` doc comment). "No per-installation secrets
  cross the handoff" in `README.md` § Credential lifecycle means no token,
  NOT no secrets.
- Three per-installation secrets DO arrive inside the signed `InstallData`
  (`src/handoff.ts`): `webhook_secret` (the endpoint's `whsec_…`, handed over
  ONCE per rotation), `proxy_secret` (the installation's `whsec_…` proxy
  secret, ONCE per install/resync), and `embed_secret` (the `embsec_…` HS256
  key for dashboard session tokens on the embedded merchant page). Each is
  null (or absent, for `embed_secret`) when the app does not use that
  channel — absence is the signal.
- `QUEEK_APP_SECRET` (the app signing secret) verifies the handoff only.
  `queek app deploy` writes it to `.queek/.env.local` on first registration,
  shows it once, and never returns it again (CLI
  `src/commands/app/deploy.ts`).
- A redelivered install for an existing installation merges idempotently
  (`saveResyncedInstallation`): secrets, settings and scopes refresh,
  `installedAt` is kept, and the cached token is kept UNLESS the scope grant
  changed, in which case it is dropped so the next call re-mints
  (`src/install-handlers.ts`).

## Uninstall is the deletion trigger

Treat the uninstall handoff as the deletion trigger: the default
`onUninstall` deletes the installation row (secrets, token cache,
settings) — keep that delete when overriding it, and purge app-side working
data keyed by the installation there too (`README.md` § Data deletion;
default in `uninstallDelivery`, `src/install-handlers.ts`).

## App credential and installation tokens

- Credential: `loadAppCredential({ appSlug?, keyId?, privateKeyPem?, env? })`
  reads `APP_SLUG`, `APP_KEY_ID`, `APP_PRIVATE_KEY` (raw PEM, one-line PEM
  with `\n` escapes, or base64 of the PEM; validated as RSA at boot;
  `src/app-auth.ts`).
- `createAppTokenProvider({ credential, store })` returns the token provider;
  `createInstallationClient({ installationId, apiBase, tokens })` returns the
  Merchant client that resolves the token via `acquireToken()` and sends it as
  `X-Client-Key` (`src/tokens.ts`; `README.md`, the paragraph before
  § Credential lifecycle).
- `acquireToken` serves the cached token while its expiry is more than
  `TOKEN_VALIDITY_SKEW_SECONDS` (300 s) away, otherwise signs an RS256 app
  JWT (`iat` = now − `APP_JWT_SKEW_SECONDS` 60, `exp` = `iat` +
  `APP_JWT_TTL_SECONDS` 540, header `kid`) and POSTs `access_tokens`
  (`src/app-auth.ts`; `src/tokens.ts` `mintPath`, `APP_API_PATH`
  `/api/v1/apps`).
- Failure codes, each held in one constant in `src/app-auth.ts`:
  `invalid_client` (401, halts minting), `app_token_revoked` (403, kill
  switch: drop all tokens, halt), `app_installation_gone` (404, purge that
  installation), `app_installation_pending` (409, retry later, never purge),
  `resync_cooldown` (429, skip), `too_many_requests` (429, honour
  `Retry-After`) (`README.md` § Credential lifecycle, item 4).
- Key rotation: add a `kid` (both verify) → switch the app to it → wait one
  token TTL → remove the old `kid` (`README.md` § Credential lifecycle,
  item 6).
- Recovery after DB loss or a long outage: `resyncFromQueek({ apiBase,
  tokens, store })` (`src/resync.ts`). It restores connectivity only; app
  working data needs your own backups (`README.md` § Data rule + backups).

## Embedded page session tokens (server only)

The framed merchant page receives a dashboard session token; verify it
server-side before trusting a call that carries one (`README.md` § Embedded
merchant page).

- Import from `@usequeek/app-sdk/server` only — the secret must never enter
  a browser bundle (`src/server.ts`).
- `verifySessionToken(token, { secret, audience, issuer, expected })`: HS256
  over the installation's `embsec_…` secret (raw UTF-8 bytes), `audience` =
  the app slug, `issuer` = the handoff `api_base` verbatim, `expected` =
  `{ installationId, vendorId, appSlug, appId }` from your own row; 20 s
  clock tolerance (`SESSION_CLOCK_TOLERANCE_SECONDS`) (`src/session.ts`).
- `verifyLaunchToken` verifies the signed-first-load token (`purpose` must be
  `launch`); a launch token is refused as a bridge token and vice versa
  (`src/session.ts` header comment). `sessionTokenInstallationId(token)`
  reads the installation id as an unverified routing hint only.
- Serve the page with `Content-Security-Policy: frame-ancestors <dashboard
  origin>` (`README.md` § Embedded merchant page).
