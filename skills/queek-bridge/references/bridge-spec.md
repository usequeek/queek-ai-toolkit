# Bridge behavior: SDK-enforced vs dashboard-planned

Sources: `@usequeek/app-sdk` `src/frame.ts` (SDK side, shipped) and
`queek_backend/.agent/TASKS/active/app-ui-kit.md` MERGED item 3 (dashboard
side, PLANNED — no host implementation exists in `queek-merchant` as of
30/9/26; a repo-wide search for the bridge message strings finds no
dashboard receiver). Every PLANNED line below must be re-verified before an
app depends on it.

## Handshake (SDK side)

`ready` carries `capabilities` + `sdkVersion` (`frame.ts:89`; app source
constant `APP_SOURCE = "queek-app"`, dashboard `DASHBOARD_SOURCE =
"queek-merchant"`, `frame.ts:18-19`). The app declares what it speaks; old
apps degrade to the current dashboard chrome (plan wording).

## What the SDK enforces today (`src/frame.ts`)

- Client-side length caps: every outbound string is truncated to its cap
  (`MAX_HEADING_LENGTH = 200`, `MAX_TOAST_LENGTH = 500`,
  `MAX_PATH_LENGTH = MAX_TARGET_LENGTH = 2048`, …; `frame.ts:24-40`).
- Outbound clipping/sanitizing through `clipOutbound` — "the same sanitizer
  the senders use" (`frame.ts:450`).
- `open` targets: `isAllowedOpenTarget` (`frame.ts:324-334`) accepts a
  dashboard-relative reference or an absolute https URL and refuses
  `javascript:`/`data:`/protocol-relative/backslash shapes — AND "the
  dashboard applies its own allowlist on top … The dashboard re-validates
  every target" (`frame.ts:318-323`). The SDK check is necessary, not
  sufficient.
- Inbound parsing ignores unknown types silently (forward compatibility,
  both directions; `parseInboundMessage`, `frame.ts:341-348`).
- Versioning: dashboard `theme` message carries `capabilities` + `bridge`
  (`frame.ts:116-123`); SDK constant `BRIDGE_VERSION = "1"`
  (`frame.ts:22`). Absent on legacy dashboards — assume the v0 set
  (ready/token/resize only).

## PLANNED dashboard behaviors (app-ui-kit.md MERGED item 3 — NOT in code)

- Per-frame rate limiting of bridge messages.
- The picker UI: `pick-resource` with `resourceType: "product"` (field name
  is `resourceType`, `frame.ts:104-111` — not `type`), `multiple ≤ 100`,
  `filter` (e.g. digital), `selectionIds` (preselect only) →
  `resource-picked` with `items: [{ p_id, title, image }]`; client-side
  check that the installation's effective scopes hold
  `merchant-items-read`; app name shown; one picker at a time, throttled.
- Resumable paths: `navigated{path}` → dashboard replaces the URL;
  back/forward → `navigate{path}` with a loop guard; apps never navigate
  the frame themselves (app-ui-kit.md items 2, 2b).
- `title`, `title-action`, `toast`, `save-bar` / `save-bar-action`,
  `navigate`, `theme{light|dark}` + `locale` rendering in dashboard chrome.
