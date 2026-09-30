# Freshness rule

Sources: `queek_backend/config/scramble.php:36`,
`queek_backend/app/Support/Api/ApiContract.php:23`,
`@usequeek/app-sdk` `scripts/gen-merchant-types.mjs` + `README.md:308`,
the live spec `https://api.usequeek.com/docs/merchant.json` (fetched
30/9/26), and plan `app-live-types-and-ai-toolkit.md` G1/B2 (policy only).

## Pins (all verified in code or the live spec)

- Spec version name: `info.version` = `API_VERSION` env, default `v1`
  (`config/scramble.php:36`; live spec serves `info.version: v1`).
- Runtime version header: `X-Queek-Api-Version` (`ApiContract.php:23`,
  `VERSION_HEADER`).
- "Additive under `v1`" is POLICY from the plan (G1; contract text is B2),
  NOT a served-spec claim: the live spec (30/9/26) contains no additive or
  v2-alongside text. Treat it as the rule you code against, not as text you
  quote from the spec.

## The rule

1. Types never auto-update. The SDK's bundled generated types
   (`src/merchant-schema.ts`, via `openapi/merchant.json`) are a
   compatibility snapshot, not the freshness mechanism (`README.md:308`:
   "Types come from `openapi/merchant.json`, the committed snapshot of the
   live contract").
2. After every backend deploy that touches the Merchant API, re-run
   codegen (`npm run gen:merchant [url-or-path]`) and commit the diff.
3. A pinned old snapshot keeps compiling and working; new fields stay
   untyped until you re-run.
4. What does NOT exist today (verified 30/9/26 — do not claim it): no CLI
   stale-types warning, no date-versioned spec URL, no `x-queek-spec-sha`
   (B1 unlanded; the live spec carries no content hash). Freshness is the
   manual re-run in step 2, full stop. Re-check this section when B1/B2
   land.
