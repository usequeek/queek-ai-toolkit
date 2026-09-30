# Freshness rule

Sources: `queek_backend/config/scramble.php:36`,
`queek_backend/app/Support/Api/ApiContract.php:23`,
`@usequeek/app-sdk` `scripts/gen-merchant-types.mjs` + `README.md:308`.

## Pins (all verified in code)

- Spec version name: `info.version` = `API_VERSION` env, default `v1`
  (`config/scramble.php:36`).
- Runtime version header: `X-Queek-Api-Version` (`ApiContract.php:23`,
  `VERSION_HEADER`).
- The API is additive under `v1`: stale types only miss new fields; calls
  keep working.

## The rule

1. Types never auto-update. The SDK's bundled generated types
   (`src/merchant-schema.ts`, via `openapi/merchant.json`) are a
   compatibility snapshot, not the freshness mechanism (`README.md:308`:
   "Types come from `openapi/merchant.json`, the committed snapshot of the
   live contract").
2. After every backend deploy that touches the Merchant API, re-run
   codegen (`npm run gen:merchant [url-or-path]`) and commit the diff.
3. A pinned old snapshot keeps compiling and working (additive API); new
   fields stay untyped until you re-run.
4. What does NOT exist (do not claim it): no CLI stale-types warning, no
   date-versioned spec URL, no spec-content hash — freshness is the manual
   re-run in step 2, full stop.
