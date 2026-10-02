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

Document shape: `meta` (`schema`, `git_sha`, `doc_url`), `primitives`
(mechanical facts), `needs[]` (`id`, `area`, `title`, `summary`,
`status` of `supported`, `partial` or `missing`, `surface[]` of public
`{kind,name}` primitives, `shopify{name,url}`, `limits[]`, `workaround`,
`tags[]`), and `use_cases[]` (`id`, `title`, `summary`,
`needs[{id,critical,status}]`, `verdict`, `optional_gaps[{id,status}]`).
`meta.git_sha` is a content hash used as the document revision. Fields the
document does not carry are treated as absent. Treat a missing
`optional_gaps` as none; ignore `generated_at` if present. Do not expect a
timestamp, `probe`, or `internal` fields.

Fallback, explicit: if the request fails or 404s (the endpoint may not
be deployed yet), say so, fall back to
`https://api.usequeek.com/docs/merchant.json` plus docs.usequeek.com,
and tell the developer capacity could not be verified — never guess.

## Procedure

1. Download `llms.txt`; pull `capabilities.json` only for the detail
   the idea needs.
2. Decompose the idea into capabilities — see
   `cat references/decompose.md` for the dimensions to think through.
3. Match the whole idea to `use_cases` by `id`, `tags`, then `title`.
   Match each decomposed capability to `needs` by `id`, `tags`, then
   `title`.
4. If a `use_case` matches, read its `verdict` and `optional_gaps`;
   never compute a replacement verdict from need statuses. A `buildable`
   use case stays buildable when it has optional gaps: name those gaps
   and explain their documented workarounds.
5. If no `use_case` matches, match the decomposed capabilities to needs
   and classify each as critical or optional from the idea's requirements.
   State that this is your assessment. Verdict rule: `blocked` if any
   critical need is `missing`; `partial` if any critical need is `partial`
   and none is `missing`; otherwise `buildable`; optional needs never
   change it. List optional needs that are `partial` or `missing` as
   `optional_gaps` and explain documented workarounds.
6. For each need report its `status`, supporting `surface` primitive(s),
   `limits`, and the doc's `workaround`.
7. Write the report — see `cat references/report-format.md`.

## Decision rules

- Buildable: continue with the `queek-app` skill. Mention any optional
  gaps and their documented workarounds in the report.
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
