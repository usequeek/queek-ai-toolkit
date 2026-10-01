# Codegen flow

Source: `@usequeek/cli` 0.14.0 `packages/cli/src/commands/app/codegen.ts`
(`AppCodegen`, released — verify with `queek app codegen --help`).
(Repo: `usequeek/theme-tools`.) This is the reference implementation — reuse
its logic verbatim; do not invent a second flow.

`queek app codegen` — RELEASED in `@usequeek/cli` 0.14.0. It writes
app-owned `types/merchant.ts` + the recorded spec hash in
`.queek/codegen.json` (offline warn + exit 0). The recorded pin is the
committed `types/merchant.ts` `Spec sha256:` provenance header
(`.queek/codegen.json` is a local debug aid).

## Command

```sh
queek app codegen [spec-url-or-path]
```

- Default source (no arg): the live spec
  `https://api.usequeek.com/docs/merchant.json`.
- File-input path: `queek app codegen /tmp/merchant.json` — exported
  from the backend without a server:
  `php artisan scramble:export --api=merchant --path=/tmp/merchant.json`
  (run against a backend checkout). Offline codegen must use this path.

## What the command does, in order

1. Fetch the URL or read the file. A default-URL failure (network,
   non-2xx, HTML edge page) warns and exits 0, keeping existing types —
   offline runs need the file path. An explicitly passed source that fails
   throws instead.
2. Loud sanity check (fails the run, never commits silently): the spec must
   be OpenAPI `3.1.0` with a `paths` object containing `/orders/import`
   (the import op the SDK depends on must exist). HTML error pages are
   refused. The check pins the merchant-scoped export — Scramble
   `--api=merchant` strips the `/api/v1/merchant` prefix, so paths are
   scope-relative.
3. Normalize exactly one field: `servers` →
   `[{ url: "https://api.usequeek.com/api/v1/merchant", description: "Current" }]`.
   Paths and schemas are untouched. (A local Scramble export points
   `servers` at localhost; the reviewed contract is the public base.)
4. Run `openapi-typescript` → the committed generated types
   `types/merchant.ts`. A rerun with an unchanged spec writes nothing.

## Rule

Always diff the types before committing. The committed generated file
stays diffable so reviewers see exactly which fields arrived.
