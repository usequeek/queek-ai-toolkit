# Submission checklist contract

Source: `queek_backend/.agent/TASKS/active/app-review-submission-flow.md`,
design v4 item 4 ("Checklist"). This is the review contract: prepare these
so the checklist passes.

## Item shape

Every checklist item is `{ key, level, ok, detail }` where `level` is
`error | warning`. Checks run on demand ("Run checks") and again at
submit; submit is refused while any error-level check fails or the checks
are older than 24 h.

## Items

- Listing complete (error): name, description (≥ 80 chars — a Queek
  choice), logo/icon, privacy_url, support_url, category.
- Tested (error): THIS version reached `active` at least once (ever-active
  counts — a later uninstall does not un-earn it; failed installs neither
  satisfy nor penalise).
- Endpoints (error): install / uninstall / webhook URLs are HTTPS and
  publicly reachable; a webhook sent with a FORGED signature is rejected
  (4xx) by the app; the app answers a correctly signed ping with 2xx.
- Embedded page (warning): `merchant_page_url` sends a restrictive
  `frame-ancestors`.

## Live route (verified in code)

- App-scoped submit of the latest development version:
  `POST apps/{app}/submit` (`queek_backend/routes/vendor-api.php:1049-1050`,
  `DeveloperAppController::submit`, throttled `developer-submit`).
- Deploy never submits: releasing a version only creates it
  (`development`); submission is the explicit, separate step.
