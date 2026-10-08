# Capacity report format

Sources: the Queek API live capability docs
`docs/capabilities/llms.txt` (compact) and `docs/capabilities.json`
(detail); when the verdict allows building, continue with the
`queek-app` skill (`skills/queek-app/SKILL.md`).

The compact `llms.txt` starts with its schema, `sha`, and JSON URL, then
lists use cases with verdicts and optional gaps, needs by area, and a
primitives digest. Read its use-case verdicts and optional gaps before
the needs digest; fetch matching needs from the JSON for detail. When
`optional_gaps` is not present, derive it from the referenced needs that are
non-critical and whose status is not `supported`, and report those gaps
without changing the document's verdict. If `probe`, `probe_pass`, `internal`,
or `generated_at` are present, ignore them and never cite them. Fields the
document does not carry are treated as absent.

Show the developer these sections, in this order. Quote need
`id`s and the `x-queek-capabilities-sha` revision so the report stays
checkable against the live doc. For a matched use case, include its
`verdict` and `optional_gaps`. A `buildable` verdict with optional gaps
stays buildable when every critical dimension is matched to a supported
need: name each gap and explain its documented workaround.
An unmatched critical dimension makes that dimension unverified: report
overall capacity as unverified, do not scaffold its dependent part, and say
so. Claim `buildable` only when every dimension of the idea is covered by a
matched critical need marked `supported`.
For an idea without a matching use case, label the verdict as your own
assessment and state which needs you classified as critical or optional.

## 1. Verdict

One word — `buildable`, `partial`, `blocked`, or `unverified` — plus the matching
`use_case` `id` when one matched. Include that use case's
`optional_gaps[{id,status}]`, or state there are no optional gaps. When
none matched, say "Agent assessment: no use_case matched" and apply the
critical-only rule: blocked if any critical need is missing; partial if
any critical need is partial and none is missing; otherwise buildable.
Optional needs never change the verdict. Claim buildable only when every
idea dimension is covered by a matched critical need marked `supported`.
If a critical dimension has no matching need or use case, mark it
unverified, report overall capacity as unverified, and do not scaffold its
dependent part. When the live doc could not be read, the verdict is
"unverified: capacity could not be verified" and nothing below may claim
support.

## 2. Capability table

One row per need checked: need `id`, `status`, the supporting public
`surface` primitive(s) (`{kind,name}`), `limits`, and the doc's
`workaround`. Mark critical needs using the matched
`use_cases[].needs[].critical`, or your own decomposition when no use
case matched.

## 3. What can be built

The buildable subset only — every item traces to a need the doc marks
`supported` or `partial`.

## 4. What is blocked and why

Each blocked item names the exact missing platform primitive (the need
`id` and its `summary`) and the doc's `limits`. If the doc lists nothing
further, write "nothing listed", never inventing one.

## 5. Optional gaps and workarounds

List every `optional_gap` with its status and the doc's own `workaround`.
For matched use cases, preserve the doc's optional classification. For
an unmatched idea, list optional needs with `partial` or `missing`
status. You may also include the standing pattern: run logic on the
app's own server and call the Merchant API from there. A workaround
that needs a primitive the doc marks `missing` is not a workaround —
move it to section 4.

## 6. What NOT to attempt

The explicitly excluded list: anything whose need is `missing`, and
anything no need covers at all. Short sentences, no hedging.
