---
name: queek-app
description: "Check platform capacity via the queek-capacity skill first, then build a Queek app on the Merchant API: install/uninstall/settings handoff (verify first), Standard Webhooks and app-proxy verification with whsec_ secrets, and the typed Merchant API client over X-Client-Key with Idempotency-Key writes. Use for any Queek app install flow, webhook handler, or Merchant API call."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek app

Building something new (not fixing this app's code)? Run the capacity
check first — see the `queek-capacity` skill — then come back here.

Framework-agnostic, Web-standard handlers (`Request` in, `Response` out).
Read the reference file that fits the task before writing code:

- Install / uninstall / settings handoff, app credentials, embedded-page tokens → `cat references/install-handoff.md`
- Topic webhooks and app-proxy verification → `cat references/webhooks.md`
- Calling the Merchant API → `cat references/merchant-client.md`
- Optional scopes (query / request / revoke, `app/scopes_update`) → `cat references/scopes.md`

SDK entry points (`@usequeek/app-sdk` 0.6.1, `package.json` `exports`):

| Import | For | Carries |
|---|---|---|
| `@usequeek/app-sdk` | Server / universal code | handlers, clients, stores (`src/index.ts`) — NOT browser-bundlable |
| `@usequeek/app-sdk/server` | Session-token verification | `verifySessionToken`, `verifySessionTokenDetailed` — server only (`src/server.ts`) |
| `@usequeek/app-sdk/hono` | Hono apps | `createInstallHandlers`, `createWebhookHandler`, `createProxyHandler` (`src/hono.ts`) |
| `@usequeek/app-sdk/react` | React apps | `QueekProvider`, `useQueek` (`src/react.ts`) |
| `@usequeek/app-sdk/browser` | Plain-browser code | `installAuthFetch`, frame + theme helpers (`src/browser.ts`) — browser only |

Browser rule: code that ships to the browser imports from
`@usequeek/app-sdk/browser`, never from the main entry — the main barrel
pulls `node:crypto` / `pg` and breaks browser builds.

Rules that apply everywhere in this skill:

1. Verify every signed delivery BEFORE acting on it (signature check first,
   then parse, then run business logic). Never proof-call the Merchant API
   before answering the delivery.
2. Never log a secret. Never hand-roll key derivation either: topic
   webhooks decode the `whsec_` secret internally (`secretKeyBytes`) and
   the proxy uses the full string — call `verifyQueekSignature` /
   `verifyProxyQuery`, do not reimplement them (see `references/webhooks.md`).
3. Every rule below cites the SDK source file it came from. If the SDK
   disagrees with this skill, the SDK wins.
