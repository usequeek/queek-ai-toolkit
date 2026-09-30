# Codegen flow

Source: `@usequeek/app-sdk` `scripts/gen-merchant-types.mjs`
(Repo: `app-sdk-wt-bridge`). This is the reference implementation — reuse
its logic verbatim; do not invent a second flow.

## Command

```sh
npm run gen:merchant [url-or-path]
```

- Default source (no arg): the live spec
  `https://api.usequeek.com/docs/merchant.json`.
- File-input path: `npm run gen:merchant /tmp/merchant.json` — exported
  from the backend without a server:
  `php artisan scramble:export --api=merchant --path=/tmp/merchant.json`
  (run in `queek_backend`). Offline codegen must use this path.

## What the script does, in order

1. Fetch the URL (must answer 2xx) or read the file. Network failure with
   no file input throws — offline runs need the file path.
2. Loud sanity check (fails the run, never commits silently): the spec must
   be OpenAPI `3.1.0` with a `paths` object containing `/orders/import`
   (the import op the SDK depends on must exist). The check pins the
   merchant-scoped export — Scramble `--api=merchant` strips the
   `/api/v1/merchant` prefix, so paths are scope-relative.
3. Normalize exactly one field: `servers` →
   `[{ url: "https://api.usequeek.com/api/v1/merchant", description: "Current" }]`.
   Paths and schemas are untouched. (A local Scramble export points
   `servers` at localhost; the reviewed contract is the public base.)
4. Write the committed snapshot `openapi/merchant.json`, then run
   `openapi-typescript` → the committed generated types
   `src/merchant-schema.ts` (header: "GENERATED from openapi/merchant.json
   — do not edit by hand").

## Rule

Always diff the snapshot before committing. The committed generated file
stays diffable so reviewers see exactly which fields arrived.
