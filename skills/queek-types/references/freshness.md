# Freshness rule

Sources: `queek_backend/config/scramble.php` (`API_VERSION`),
`queek_backend/app/Support/Api/ApiContract.php` (`VERSION_HEADER`),
`queek_backend/app/Providers/ScrambleServiceProvider.php` (hash header,
freshness-pin block, on `origin/master`), `@usequeek/app-sdk`
`scripts/gen-merchant-types.mjs` + README § API surface (client bullet),
the live spec `https://api.usequeek.com/docs/merchant.json` (fetched
30/9/26), and plan `app-live-types-and-ai-toolkit.md` G1 (policy).

## Pins (all verified in code or the live spec)

- Spec version name: `info.version` = `API_VERSION` env, default `v1`
  (`config/scramble.php` `info.version`; live spec serves `info.version: v1`).
- Runtime version header: `X-Queek-Api-Version` (`ApiContract.php`
  `VERSION_HEADER`).
- Spec content hash (B1, landed 30/9/26): `x-queek-spec-sha` rides BOTH the
  response header and `info.x-queek-spec-sha`, stamped from the exact served
  bytes so the two can never disagree
  (`ScrambleServiceProvider.php`, freshness-pin block). Compare the hash
  your app recorded at codegen time against the live one: a mismatch means
  re-run codegen.
- "Additive under `v1`" is POLICY from the plan (G1) AND, since B2 landed
  30/9/26, served-spec text: `info.description` states "Additive-only
  under v1 … A breaking change ships as v2 alongside v1". Quote the spec.

## The rule

1. Types never auto-update. The SDK's bundled generated types
   (`src/merchant-schema.ts`, via `openapi/merchant.json`) are a
   compatibility snapshot, not the freshness mechanism: per the README §
   API surface client bullet, the bundled default does NOT auto-update and
   `openapi/merchant.json` stays in-repo as the reference input to
   codegen, unshipped in the published package.
2. After every backend deploy that touches the Merchant API, re-run
   codegen (`npm run gen:merchant [url-or-path]`, or `queek app codegen`
   once the `feat/queek-app` branch ships — PR #9, in the next
   `@usequeek/cli` release after 0.13.0) and commit the diff.
3. A pinned old snapshot keeps compiling and working; new fields stay
   untyped until you re-run.
4. What does NOT exist (verified 30/9/26 — do not claim it): no CLI
   stale-types warning (dropped by plan Decision — freshness is the manual
   re-run in step 2, full stop), no date-versioned spec URL.
