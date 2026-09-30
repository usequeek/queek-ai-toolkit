# Install handoff

Sources: `@usequeek/app-sdk` `README.md`, `src/install-handlers.ts`,
`src/handoff.ts`. (Repo: `app-sdk-wt-bridge`.)

## Order per request: verify first, then parse, then act

`src/install-handlers.ts:57` — "verify signature (freshness included) →
parse the [body]". `src/install-handlers.ts:229` runs
`verifyQueekSignatureDetailed` on the raw bytes + headers before anything
else. The Standard Webhooks headers ride on the APP signing secret
(`whsec_…`, `src/install-handlers.ts:41`).

## Handlers

- Layer 1 `handleInstallDelivery(input, { appSecret, store, onInstall?,
  onUninstall?, onSettings? })` serves the signed install / uninstall /
  settings handoff from raw bytes + headers. It routes on the request path's
  trailing segment (`install` / `uninstall` / `settings`), so one shared
  options object serves all three routes (`README.md:47-90`).
- Layer 2 `handleInstallRequest(request, …)` adapts `Request` → `Response`
  onto layer 1. Hono wrapper `createInstallHandlers` lives under
  `@usequeek/app-sdk/hono` (`src/hono.ts`; `README.md:307`).
- Next.js App Router: one route file per handoff path calling
  `handleInstallRequest(request, installOptions)` with
  `installOptions = { appSecret: process.env.QUEEK_APP_SECRET!, store }`
  (`README.md:47-54`).

## Secrets

- One asymmetric credential per app — no per-installation secrets cross the
  handoff (`README.md:170-172`).
- The app secret (`QUEEK_APP_SECRET`) verifies the handoff; the per-install
  `whsec_…` proxy secret is handed over ONCE per rotation
  (`src/handoff.ts:13,57-60`).
- A redelivered install for an existing installation merges idempotently
  (`saveResyncedInstallation`: secret + settings refresh, `installedAt` and
  the cached token kept; `README.md:232,307`).

## Uninstall is the deletion trigger

Treat the uninstall handoff as the deletion trigger: the default
`onUninstall` already deletes the installation row (secrets, token cache,
settings) — keep that delete when overriding it, and purge app-side working
data keyed by the installation there too (`README.md:254-257`).

## Credential lifecycle (installation tokens)

`README.md:170-212`: `createInstallationClient({ installationId, apiBase,
tokens })` resolves the token via `acquireToken()` and sends it as
`X-Client-Key` (`README.md:167-168`). Rotation without drama: add a `kid`
(both sides verify) → switch the app to it → wait one token TTL → remove
the old `kid` (`README.md:237`). A `404 app_installation_gone` purges that
installation locally (`README.md:212`).
