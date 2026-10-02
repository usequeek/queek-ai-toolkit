# Decompose the idea into capabilities

Sources: the Queek API (docs.usequeek.com)
`docs/capabilities/llms.txt` and `docs/capabilities.json` (document
fields: `meta`, `primitives`, `needs[]`, `use_cases[]`). Public
`surface[]` entries are `{kind,name}` primitives. A matching use case's
`verdict` and `optional_gaps[{id,status}]` are the document's assessment.
Fields the document does not carry are treated as absent.

Think through every dimension below for the developer's idea, then match
each one to `needs` by `id` first, `tags` second, `title` last. A
dimension with no matching need is unverified, not supported — say so.
Also match the whole idea to `use_cases` by `id`, `tags`, then `title`.

When a use case matches, use its `verdict` and read its `optional_gaps`;
do not derive a second verdict from its need statuses. A `buildable` use
case remains buildable with optional gaps. Report each gap and its
documented workaround.

When no use case matches, classify needs as critical or optional from the
idea you decomposed, and label the result as your own assessment. Verdict
rule: `blocked` if any critical need is `missing`; `partial` if any
critical need is `partial` and none is `missing`; otherwise `buildable`.
Optional needs never change this verdict. List optional needs with
`partial` or `missing` status as `optional_gaps`, with their documented
workarounds.

- Payments: taking money, refunds, payouts to the merchant.
- Shipping: rates at checkout, labels, tracking, fulfilment events.
- Discounts and pricing: codes, automatic rules, price overrides.
- Orders: reading and changing orders after they are placed.
- Customers: profiles, segments, consent state.
- Catalog: products, variants, inventory levels.
- Storefront surface: where the app appears to shoppers, and how it
  is embedded there.
- Dashboard surface: where the app appears to the merchant inside
  the admin.
- Notifications: messages to the shopper or the merchant.
- Realtime: events the app must react to as they happen.
- Data storage: records the app itself needs to keep.
- Files: uploads, downloads, and asset hosting.
- Billing: charging the merchant for the app.
- Channels: selling surfaces beyond the main storefront.
- AI: model-assisted features inside the app.
- Auth and scopes: what the app may act on, and how the merchant
  grants or revokes it.
- Webhooks: which event deliveries the app subscribes to.

For a payment-gateway-shaped idea, for example, the load-bearing
dimensions are payments, orders, webhooks, and auth and scopes — check
those needs first, then the rest. Payment handling that the doc marks
`missing` stays missing: an app-side workaround still has to move the
money through a primitive the doc actually lists.
