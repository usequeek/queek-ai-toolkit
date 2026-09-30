# Bridge behavior spec

Source: `queek_backend/.agent/TASKS/active/app-ui-kit.md`, MERGED BUILD
LIST item 3 ("Bridge v1 (dashboard + SDK typed helpers)").

## Handshake

`ready` carries `capabilities` + the kit version; old apps degrade to the
current dashboard chrome. `theme` carries `light | dark` + `locale`
(handshake + change notifications).

## What the bridge does

`title`, `title-action`, `toast`, `save-bar` / `save-bar-action`,
`navigate` / `navigated`, `open` (dashboard path or https URL, allowlisted —
the sandbox has no popups/top navigation), `pick-resource`
(`{ type: 'product', multiple ≤ 100, filter e.g. digital, selectionIds
preselect only }`) → `resource-picked` (`{ items: [{ p_id, title,
image }] }`).

## Rules

- Every string is sanitized, text-only, length-capped, and rate-limited per
  frame.
- The picker requires the installation's effective scopes to hold
  `merchant-items-read` (client-side check — state it in the UI), shows the
  app name, runs one at a time, throttled.
- The picker reuses the Merchant API products listing + product selector
  (verify `p_id` in the listing).
- In-app moves update the URL (`navigated{path}` → dashboard replaces the
  URL) so every in-app page is resumable; back/forward comes back as
  `navigate{path}` with a loop guard. Apps never navigate the frame
  themselves (`app-ui-kit.md` items 2, 2b).
