# Webhooks and app-proxy verification

Sources: `@usequeek/app-sdk` `src/signatures.ts:11-17,50-76`,
`src/proxy.ts:36,81-95,113-117`, `src/webhooks.ts:185-197`,
`README.md:281,305,310`, `src/logger.ts:26-30`.
(Repo: `app-sdk-wt-bridge`.)

Topic webhooks and the app proxy derive their MAC keys DIFFERENTLY. Do not
mix them up.

## Topic webhooks — Standard Webhooks over the DECODED secret bytes

- `verifyQueekSignature` (`signatures.ts`): Standard Webhooks verification —
  `webhook-id`, `webhook-timestamp`, `webhook-signature` over
  `{id}.{timestamp}.{body}`, keyed by the DECODED bytes of the `whsec_…`
  secret, with timestamp-skew enforcement (`README.md:305`).
- Key derivation is `secretKeyBytes` (`signatures.ts:50-63`): strip the
  `whsec_` prefix, base64-decode the remainder, and use those bytes as the
  HMAC-SHA256 key. A secret without the prefix (or with undecodable base64)
  falls back to the raw string — mirroring the backend's `keyFor()`.
- Wire format: one or more space-delimited `v1,<base64>` signatures in
  `webhook-signature`; ANY match verifies (rotation grace).
  `signQueekPayload` (`signatures.ts:65-76`) emits `v1,<base64>`.
- Freshness: deliveries older than `MAX_TIMESTAMP_SKEW_SECONDS` (5 minutes,
  the Standard Webhooks default; `signatures.ts:25-26`) are rejected as
  stale before the MAC is even checked.
- Unknown topics answer 200 without running a handler (forward
  compatibility, not consent): that 200 must not swallow a future privacy
  topic. Register explicit handlers for mandatory privacy topics; an
  unhandled topic only reports `unhandled: true` and deletes nothing
  (`src/webhooks.ts:191-197`; `README.md:259-261`).

## App proxy — hex HMAC over the FULL secret string (NOT decoded)

- `signProxyQuery` (`proxy.ts:94-95`): hex HMAC-SHA256 computed over the
  FULL `whsec_…` string — no base64 decode (`README.md:281`). This is the
  opposite of topic webhooks; using `secretKeyBytes` here breaks verification.
- Canonical string (`buildProxyCanonicalString`, `proxy.ts:81-87`):
  `path\nshop\nts\nsorted(k=v&...)` — sig excluded, keys byte-sorted,
  rawurlencoded pairs. Mirrors backend `AppProxyService::signature()` exactly.
- Skew: 5-minute default floored at 60 s like the backend
  (`proxySkewExceeded`, `proxy.ts:113-117`).
- Replay: single-use `jti` is claimed per delivery (`proxy.ts:232-236`);
  `handleProxyRequest` serves GET only (other methods → 405
  `method_not_allowed`).

## App proxy — delivery plumbing

- `verifyProxyQuery` / `verifyProxyQueryDetailed` (`proxy.ts`): app-proxy
  query verification byte-exact with the backend —
  `path\nshop\nts\nsorted(k=v&...)`, hex HMAC-SHA256 over the FULL
  `whsec_…` string, 5-minute skew floored at 60 s, `timingSafeEqual`,
  previous-secret grace over the secrets list (`README.md:310`).
- Layer 1 `verifyProxyDelivery(input, { store, … })` resolves the
  installation from the store by `kid` and claims single-use `jti`; layer 2
  `handleProxyRequest(request, { store, path, … }, onVerified)` serves GET
  only. The Hono wrapper `createProxyHandler` lives under
  `@usequeek/app-sdk/hono` (`src/hono.ts`; `README.md:310`).
- `kid` is the routing hint (the installation p_id Queek signs in); without
  a `kid` the store falls back to wider matching (`src/proxy.ts:36,185-210`,
  `PROXY_KID_PARAM = "kid"`).

## Never log secrets

The logger redacts `sk_*` / `pk_*` / `whsec_*` / `Bearer` values and bare
RS256 JWTs (`src/logger.ts:26-30`; `README.md:322`). Keep that redaction:
never print a secret while debugging a webhook.
