import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readCapabilities, optionalGaps, assessVerdict } from "./capabilities-reader.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const capacityFiles = ["SKILL.md", "references/decompose.md", "references/report-format.md"];
const capacityText = capacityFiles.map((f) => readFileSync(join(root, "skills/queek-capacity", f), "utf8")).join("\n");

// Neutral sample document in the live shape.
const sample = () => ({
  meta: { schema: 1, git_sha: "abc123", doc_url: "https://api.usequeek.com/docs/capabilities.json" },
  primitives: { api_scopes: [], webhook_topics: [] },
  needs: [
    {
      id: "orders.read", area: "orders", title: "Read orders", summary: "List and fetch orders.",
      status: "supported", surface: [{ kind: "route", name: "GET api/v1/orders" }],
      limits: ["Paged."], workaround: "", tags: ["orders"],
    },
    {
      id: "reports.export", area: "reports", title: "Export reports", summary: "Download a report file.",
      status: "partial", surface: [], limits: [], workaround: "Run the export on the app server.", tags: ["reports"],
    },
  ],
  use_cases: [
    {
      id: "order_sync", title: "Order sync", summary: "Mirror orders elsewhere.",
      needs: [{ id: "orders.read", critical: true, status: "supported" }, { id: "reports.export", critical: false, status: "partial" }],
      verdict: "buildable", optional_gaps: [{ id: "reports.export", status: "partial" }],
    },
  ],
});

// Adds a foreign field (and a companion note) at every object level except
// inside `primitives`, which the skill reads as an opaque block of facts.
function addForeignFields(value) {
  if (Array.isArray(value)) return value.map(addForeignFields);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === "primitives" ? v : addForeignFields(v);
    out.partner_reference = { name: "Some other platform", url: "https://example.invalid/page" };
    out.partner_reference_null_reason = "not applicable";
    return out;
  }
  return value;
}

const keysDeep = (v, out = new Set()) => {
  if (Array.isArray(v)) v.forEach((x) => keysDeep(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) (out.add(k), keysDeep(x, out));
  return out;
};

test("reader output is identical with or without foreign fields on every object", () => {
  const plain = readCapabilities(sample());
  const noisy = readCapabilities(addForeignFields(sample()));
  assert.deepEqual(noisy, plain);
  assert.ok(![...keysDeep(noisy)].some((k) => k.startsWith("partner_")), "foreign fields never survive projection");
});

test("reader needs no foreign field: removing one everywhere changes nothing", () => {
  const withField = sample();
  withField.needs.forEach((n) => { n.reference = { name: "x", url: "https://example.invalid" }; n.reference_null_reason = "none"; });
  const without = sample();
  assert.deepEqual(readCapabilities(withField), readCapabilities(without));
});

test("reader fails closed on a broken shape", () => {
  const noNeeds = sample(); delete noNeeds.needs;
  assert.throws(() => readCapabilities(noNeeds), /needs must be an array/);
  const badStatus = sample(); badStatus.needs[0].status = "unknown";
  assert.throws(() => readCapabilities(badStatus), /needs\[0\]\.status must be one of/);
  const noMeta = sample(); delete noMeta.meta;
  assert.throws(() => readCapabilities(noMeta), /meta is required/);
});

test("optional gaps derive from non-critical, non-supported needs when the field is absent", () => {
  const doc = sample();
  delete doc.use_cases[0].optional_gaps;
  const [useCase] = readCapabilities(doc).use_cases;
  assert.deepEqual(optionalGaps(useCase), [{ id: "reports.export", status: "partial" }]);
  assert.equal(useCase.verdict, "buildable", "derived gaps never change the document verdict");
});

test("critical-only verdict rule", () => {
  assert.equal(assessVerdict(["supported", "missing", "partial"]), "blocked");
  assert.equal(assessVerdict(["supported", "partial"]), "partial");
  assert.equal(assessVerdict(["supported"]), "buildable");
});

test("capacity skill text names only schema fields and reserved words", () => {
  const allowed = new Set([
    "meta", "schema", "git_sha", "doc_url", "primitives", "needs", "needs[]", "use_cases", "use_cases[]",
    "id", "area", "title", "summary", "status", "surface", "surface[]", "limits", "limits[]", "workaround",
    "tags", "tags[]", "verdict", "optional_gaps", "optional_gap", "use_case", "{kind,name}",
    "optional_gaps[{id,status}]", "needs[{id,critical,status}]", "use_cases[].needs[].critical", "meta.git_sha",
    "supported", "partial", "missing", "buildable", "blocked", "unverified",
    "probe", "probe_pass", "internal", "generated_at", "sha", "x-queek-capabilities-sha",
    "queek-app", "llms.txt", "capabilities.json", "docs/capabilities.json", "docs/capabilities/llms.txt",
    "skills/queek-app/SKILL.md", "cat references/decompose.md", "cat references/report-format.md",
    "https://api.usequeek.com/docs/capabilities.json", "https://api.usequeek.com/docs/capabilities/llms.txt",
    "https://api.usequeek.com/docs/merchant.json",
  ]);
  const tokens = [...capacityText.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);
  assert.ok(tokens.length > 30, "scans a real token set");
  for (const token of new Set(tokens)) assert.ok(allowed.has(token), `capacity skill names \`${token}\`, which is not part of the documented shape`);
});

test("capacity skill declares every other document field out of scope", () => {
  const text = capacityText.replace(/\s+/g, " ");
  assert.ok(text.includes("Any other field, at any level, is out of scope whatever its name"));
  assert.ok(text.includes("The report is identical whether the document carries such a field or not"));
  assert.ok(text.includes("Leave out any comparison to another product and any external link"));
});

// Optional: check the live shape. Point CAPABILITIES_JSON at a downloaded
// copy of https://api.usequeek.com/docs/capabilities.json.
test("live capabilities document satisfies the shape the skill relies on", (t) => {
  const file = process.env.CAPABILITIES_JSON;
  if (!file || !existsSync(file)) return t.skip("set CAPABILITIES_JSON to a downloaded capabilities.json to enable");
  const doc = JSON.parse(readFileSync(file, "utf8"));
  const read = readCapabilities(doc);
  assert.ok(read.needs.length > 0 && read.use_cases.length > 0);
  const ids = new Set(read.needs.map((n) => n.id));
  for (const u of read.use_cases) {
    for (const r of u.needs) assert.ok(ids.has(r.id), `${u.id} references unknown need ${r.id}`);
    for (const g of optionalGaps(u)) assert.ok(ids.has(g.id), `${u.id} optional gap ${g.id} is not a need`);
  }
  // Dropping every field the reader does not use must not change what it reads.
  const reread = readCapabilities(JSON.parse(JSON.stringify(read)));
  assert.deepEqual(reread, read);
});
