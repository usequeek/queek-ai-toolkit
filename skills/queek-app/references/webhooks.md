# Webhooks and app-proxy verification

Sources: `@usequeek/app-sdk` `README.md:281,305,310`, `src/signatures.ts`
(via `README.md:305`), `src/proxy.ts:36,185-210`, `src/logger.ts:26-30`.
(Repo: `app-sdk-wt-bridge`.)

## Topic webhooks — Standard Webhooks over the FULL `whsec_…` string

- `verifyQueekSignature` (`signatures.ts`): Standard Webhooks verification —
  `webhook-id`, `webhook-timestamp`, `webhook-signature` over
  `{id}.{timestamp}.{body}`, keyed by the decoded `whsec_…` bytes, with
  timestamp-skew enforcement (`README.md:305`).
- Hex HMAC-SHA256 is computed over the FULL `whsec_…` string — no base64
  decode (`README.md:281`).
- Unknown topics answer 200 without running a handler (forward
  compatibility, not consent): that 200 must not swallow a future privacy
  topic. Register explicit handlers for mandatory privacy topics; an
  unhandled topic only reports `unhandled: true` and deletes nothing
  (`README.md:259-261`).

## App proxy — byte-exact query verification

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
