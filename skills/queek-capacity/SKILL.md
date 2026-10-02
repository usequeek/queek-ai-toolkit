---
name: queek-capacity
description: "Check what the Queek platform can support BEFORE building: read the live capability docs, decompose the idea into capabilities, match needs/use_cases, and report buildable, partial, or blocked. Use for any request to build, add, or estimate a Queek app or extension, before scaffolding."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek capacity check

Run this BEFORE writing code, scaffolding, or estimating. Capacity comes
from the live docs only — never from this skill text, and never from memory.

## When to trigger

Any request to build, add, or estimate a Queek app or extension — a full
app ("I want to build <X> for Queek"), a single feature, or a time
estimate. Run the check first, then continue with the `queek-app` skill
when the verdict allows it.

## Live sources

Primary, small first:

- `https://api.usequeek.com/docs/capabilities/llms.txt` — compact,
  read this one first.
- `https://api.usequeek.com/docs/capabilities.json` — full detail;
  the response carries the `x-queek-capabilities-sha` header, quote it
  in the report so the developer knows which doc revision was checked.

Schema (fixed): `meta`, `primitives` (mechanical facts), `needs[]`
(`id`, `area`, `title`, `summary`, `status` of `supported`, `partial`
or `missing`, `surface[]`, `shopify{name,url}`, `limits[]`,
`workaround`, `tags[]`), `use_cases[]` (`id`, `title`, `summary`,
`needs[{id,critical}]`, `verdict` of `buildable`, `partial` or
`blocked`).

Fallback, explicit: if the request fails or 404s (the endpoint may not
be deployed yet), say so, fall back to
`https://api.usequeek.com/docs/merchant.json` plus docs.usequeek.com,
and tell the developer capacity could not be verified — never guess.

## Procedure

1. Download `llms.txt`; pull `capabilities.json` only for the detail
   the idea needs.
2. Decompose the idea into capabilities — see
   `cat references/decompose.md` for the dimensions to think through.
3. Match each capability to `needs` by `id`, `tags`, then `title`;
   match the whole idea to `use_cases` the same way.
4. For each need report: `status`, the supporting `primitive`(s),
   `limits`, and the doc's own `workaround`.
5. Take the overall verdict from the matching `use_case` when one
   matches; otherwise the worst need `status` decides (`missing`
   anywhere critical means blocked).
6. Write the report — see `cat references/report-format.md`.

## Decision rules

- Buildable: continue with the `queek-app` skill.
- Partial: propose the buildable subset plus the doc's workarounds,
  and ask the developer to confirm before scaffolding.
- Blocked: do not scaffold a placeholder implementation. Explain what
  is missing, offer the closest buildable alternative, and stop.

## Prohibitions

- Never claim a capability that is absent from the live doc.
- Never cite an endpoint you did not see in the live doc or spec.

## After building

Re-run this check against the final manifest before the developer
deploys: every manifest key and scope the app requests must trace to a
need the doc marks `supported` or `partial`. Anything else is a
pre-deploy finding, not a silent pass.
