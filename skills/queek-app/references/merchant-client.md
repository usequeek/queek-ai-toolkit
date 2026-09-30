# Merchant API client

Sources: `@usequeek/app-sdk` `src/client.ts:16-29,165-180,296,335,345,379-384`,
`README.md:167-168,308`, `scripts/gen-merchant-types.mjs` (servers line).
(Repo: `app-sdk-wt-bridge`.)

## Base and auth

- Public base (the reviewed contract; `gen-merchant-types.mjs` normalizes
  `servers` to exactly this):
  `https://api.usequeek.com/api/v1/merchant`
- Auth is the installation credential only: `X-Client-Key: sk_…`
  (`src/client.ts:16-17`). Every call sets it from the client's apiKey
  (`src/client.ts:335`).
- In apps, prefer `createInstallationClient({ installationId, apiBase,
  tokens })`, which resolves the installation's token via `acquireToken()`
  and sends it as `X-Client-Key` (`README.md:167-168`). The low-level
  `createQueekClient({ apiBase, apiKey })` is the typed fetch client underneath
  (`README.md:308`).

## Idempotency on writes

- Writes (POST/PUT/PATCH/DELETE) carry an `Idempotency-Key`, generated when
  the caller does not supply one (`src/client.ts:19-20,345`).
- Pass `idempotencyKey?` per call (`src/client.ts:165-166`); `isWriteMethod`
  covers POST/PUT/PATCH/DELETE (`src/client.ts:173-178`).
- Retries of 429s and network errors reuse the SAME idempotency key: the key
  is generated once per logical call and reused across attempts
  (`src/client.ts:29,296,379-384`).

## Errors

Typed `QueekApiError`s with 429 retry helpers (`README.md:308`). A call
surface that exists in the committed types but not on the deployment you
run against is a stale-types problem, not a bug in your call — see the
`queek-types` skill.
