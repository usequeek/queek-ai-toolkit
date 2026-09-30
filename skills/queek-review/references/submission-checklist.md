# Submission checklist contract

Sources: `queek_backend` `app/Services/Apps/SubmissionCheckService.php`
(check keys, levels, freshness — on `origin/master`), `routes/vendor-api.php`
and `app/Http/Controllers/Api/Vendor/Developer/DeveloperAppController.php`
(routes — on `origin/master`), plus the flow design
`.agent/TASKS/active/app-review-submission-flow.md` item 4 (checklist
semantics). Line numbers below are `origin/master` 30/9/26; prefer the
symbol names — they survive better than lines.

## Item shape

Every checklist item is `{ key, level, ok, detail, at }` where `level` is
`error | warning` (`SubmissionCheckService.php:113,121`). Submit is refused
while any error-level check fails or any acknowledged warning is unacked
(`:160-177`), and every `checks[].at` must be ≤ `FRESHNESS_HOURS = 24` old
vs server `now()` UTC (`:98`, `:152-166`).

## Items (keys are `CHECK_*` consts, `:36-46`; labels in `CHECK_LABELS`, `:77-83`)

- Listing complete (error): name, description (≥ 80 chars — a Queek choice,
  `:330,462`), logo/icon, privacy_url, support_url, category.
- Tested (error): THIS version reached `active` on at least one install.
  Ever-active counts — a later uninstall does NOT un-earn it; failed installs
  neither satisfy nor penalise (`:488-489`).
- Endpoints (error): install / uninstall / webhook URLs are HTTPS and
  publicly reachable; a webhook sent with a FORGED signature is rejected
  (4xx) by the app; the app answers a correctly signed ping with 2xx.
- Embedded page (warning): `merchant_page_url` sends a restrictive
  `frame-ancestors` (`:410`).
- Demo store link (warning) + demo host (error): `demo_presence` /
  `demo_host` checks exist (`WARNING_KEYS`, `:53`); the manifest keys they
  read are `demo_url` / `video_url` (see the `queek-manifest` skill).

## Live routes (verified on `origin/master`, not the design doc)

- Checklist: `GET apps/{app}/versions/{sequence}/submission`
  (`routes/vendor-api.php:1138`, `DeveloperAppController::submission`
  at `:141`).
- Submit latest development version: `POST apps/{app}/submit`
  (`routes/vendor-api.php:1129`, `DeveloperAppController::submit` at
  `:101`, throttled `developer-submit`).
- Submit an explicit version: `POST apps/{app}/versions/{sequence}/submit`
  (`routes/vendor-api.php:1140`, `DeveloperAppController::submitVersion`
  at `:315`).
- Withdraw: `POST apps/{app}/versions/{sequence}/withdraw`
  (`routes/vendor-api.php:1142`, `DeveloperAppController::withdraw` at
  `:332`).
- Deploy never submits: releasing a version only creates it
  (`development`); submission is the explicit, separate step.
