# Capacity report format

Sources: the Queek API (docs.usequeek.com)
`docs/capabilities/llms.txt` (compact) and `docs/capabilities.json`
(detail); when the verdict allows building, continue with the
`queek-app` skill (`skills/queek-app/SKILL.md`).

Show the developer exactly these sections, in this order. Quote need
`id`s and the `x-queek-capabilities-sha` revision so the report stays
checkable against the live doc.

## 1. Verdict

One word — `buildable`, `partial`, or `blocked` — plus the matching
`use_case` `id` when one matched, or the sentence "no use_case
matched; verdict falls back to the worst need status" when none did.
When the live doc could not be read, the verdict is "unverified:
capacity could not be verified" and nothing below may claim support.

## 2. Capability table

One row per need checked: need `id`, `status`, the supporting
`primitive`(s), `limits`, and the doc's `workaround`. Mark critical
needs (per the matched `use_cases[].needs[].critical`) so the
developer sees what carries the verdict.

## 3. What will be built now

The buildable subset only — every item traces to a need the doc marks
`supported` or `partial`.

## 4. What is blocked and why

Each blocked item names the exact missing platform primitive and the
doc's `shopify{name,url}` equivalent for it, so the developer can
compare with the platform they may already know. No equivalent in the
doc means writing "no equivalent listed", never inventing one.

## 5. Honest workarounds

Only the doc's own `workaround` text, plus the standing pattern: run
the logic in the app's own server and call the Merchant API from
there. A workaround that needs a primitive the doc marks `missing`
is not a workaround — move it to section 4.

## 6. What NOT to attempt

The explicitly excluded list: anything whose need is `missing`, and
anything no need covers at all. Short sentences, no hedging.
