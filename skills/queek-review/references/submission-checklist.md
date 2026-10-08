# Submission checklist contract

Sources: the Queek API submission checklist, as consumed by `@usequeek/cli`
(`packages/cli/src/lib/app-api.ts` and `packages/cli/src/commands/app/submit.ts`,
repo `usequeek/theme-tools`). Routes below are cited by method and path only,
so they cannot drift with line numbers. All paths are under
`vendor/developer/`.

## Item shape

Every checklist item is `{ key, level, ok, detail, at }` where `level` is
`error | warning`. Submit is refused while any error-level check fails or
any warning is not acknowledged, and every `checks[].at` must be at most
24 hours old against the server clock (UTC).

## Items

- Listing complete (error): name, description (at least 80 characters — a
  Queek rule), logo/icon, `privacy_url`, `support_url`, category.
- Tested (error): THIS version reached `active` on at least one install.
  Ever-active counts — a later uninstall does NOT un-earn it; failed installs
  neither satisfy nor penalise.
- Endpoints (error): install / uninstall / webhook URLs are HTTPS and
  publicly reachable; a webhook sent with a FORGED signature is rejected
  (4xx) by the app; the app answers a correctly signed ping with 2xx.
- Embedded page (warning): `merchant_page_url` sends a restrictive
  `frame-ancestors`.
- Demo store link (warning) + demo host (error): the manifest keys they
  read are `demo_url` / `video_url` (see the `queek-manifest` skill).

## Routes

- Checklist: `GET apps/{app}/versions/{sequence}/submission`.
- Submit latest development version: `POST apps/{app}/submit`.
- Submit an explicit version: `POST apps/{app}/versions/{sequence}/submit`
  (carries an `Idempotency-Key`).
- Withdraw: `POST apps/{app}/versions/{sequence}/withdraw`.
- Deploy never submits: releasing a version only creates it
  (`development`); submission is the explicit, separate step.
