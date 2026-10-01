# Merchant API client

Sources: `@usequeek/app-sdk` `src/client.ts` (`X-Client-Key`,
`Idempotency-Key`, `newIdempotencyKey`, `isWriteMethod`, `idempotencyKey`,
`createQueekClient`, `QueekApiError`), README § Example (any framework)
(`createInstallationClient`), README § API surface (client bullet),
`scripts/gen-merchant-types.mjs` (servers normalization), `src/logger.ts`
(`sk_(live|test)_` redaction).
(Repo: `usequeek/app-sdk`.)

## Base and auth

- Public base (the reviewed contract; `gen-merchant-types.mjs` normalizes
  `servers` to exactly this):
  `https://api.usequeek.com/api/v1/merchant`
- Auth is the installation credential only: `X-Client-Key: sk_…`
  (`src/client.ts`, from the client's `apiKey`). The `sk_` shape is
  corroborated twice: the live spec's `servers` description names test keys
  as `sk_test_…`, and the SDK logger redacts `sk_(live|test)_`
  (`src/logger.ts`).
- In apps, prefer `createInstallationClient({ installationId, apiBase,
  tokens })`, which resolves the installation's token via `acquireToken()`
  and sends it as `X-Client-Key` (README § Example (any framework), Hono
  section). The low-level `createQueekClient({ apiBase, apiKey })` is the
  typed fetch client underneath (README § API surface, client bullet).

## Idempotency on writes

- Writes (POST/PUT/PATCH/DELETE) carry an `Idempotency-Key`, generated
  (`newIdempotencyKey`) when the caller does not supply one.
- Pass `idempotencyKey?` per call; `isWriteMethod` covers
  POST/PUT/PATCH/DELETE.
- Retries of 429s and network errors reuse the SAME idempotency key: the key
  is generated once per logical call and reused across attempts.

## Errors

Typed `QueekApiError`s with 429 retry helpers (README § API surface, client
bullet). A call surface that exists in the committed types but not on the
deployment you run against is a stale-types problem, not a bug in your call
— see the `queek-types` skill.
