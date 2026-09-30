# Submission checklist contract

Sources: `queek_backend` `app/Services/Apps/SubmissionCheckService.php`
(check keys, levels, freshness — on `origin/master`), `routes/vendor-api.php`
and `app/Http/Controllers/Api/Vendor/Developer/DeveloperAppController.php`
(routes — on `origin/master`), plus the flow design
`.agent/TASKS/active/app-review-submission-flow.md` item 4 (checklist
semantics). Check-service and route cites name symbols on `origin/master`
(verified 30/9/26) with no line numbers, so they can't drift.

## Item shape

Every checklist item is `{ key, level, ok, detail, at }` (the `run`
return shape) where `level` is `error | warning` (`LEVEL_ERROR` /
`LEVEL_WARNING` in `SubmissionCheckService.php`). Submit is refused
while any error-level check fails or any acknowledged warning is unacked
(`SubmissionCheckService::evaluate`), and every `checks[].at` must be ≤
`FRESHNESS_HOURS = 24` old vs server `now()` UTC (`FRESHNESS_HOURS`,
`storedFresh` / `isFresh`).

## Items (keys are `CHECK_*` consts; labels in `CHECK_LABELS` — both in `SubmissionCheckService.php`)

- Listing complete (error): name, description (≥ 80 chars — a Queek choice,
  `listingCheck` / `listingMessage`), logo/icon, privacy_url, support_url, category.
- Tested (error): THIS version reached `active` on at least one install.
  Ever-active counts — a later uninstall does NOT un-earn it; failed installs
  neither satisfy nor penalise (`testedCheck`).
- Endpoints (error): install / uninstall / webhook URLs are HTTPS and
  publicly reachable; a webhook sent with a FORGED signature is rejected
  (4xx) by the app; the app answers a correctly signed ping with 2xx.
- Embedded page (warning): `merchant_page_url` sends a restrictive
  `frame-ancestors` (`embeddedMessage`).
- Demo store link (warning) + demo host (error): `demo_presence` /
  `demo_host` checks exist (`WARNING_KEYS`); the manifest keys they
  read are `demo_url` / `video_url` (see the `queek-manifest` skill).

## Live routes (verified on `origin/master`, not the design doc)

- Checklist: `GET apps/{app}/versions/{sequence}/submission`
  (`routes/vendor-api.php`, `DeveloperAppController::submission`,
  throttled `developer-read`).
- Submit latest development version: `POST apps/{app}/submit`
  (`routes/vendor-api.php`, `DeveloperAppController::submit`,
  throttled `developer-submit`).
- Submit an explicit version: `POST apps/{app}/versions/{sequence}/submit`
  (`routes/vendor-api.php`, `DeveloperAppController::submitVersion`,
  throttled `developer-submit`, `idempotent`).
- Withdraw: `POST apps/{app}/versions/{sequence}/withdraw`
  (`routes/vendor-api.php`, `DeveloperAppController::withdraw`,
  throttled `developer-submit`).
- Deploy never submits: releasing a version only creates it
  (`development`); submission is the explicit, separate step.
