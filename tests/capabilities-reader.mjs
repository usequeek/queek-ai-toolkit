// Executable form of the document shape the queek-capacity skill relies on.
// It reads ONLY the fields the skill names; every other key, at any level,
// is dropped. If this reader needs a new field, the skill text must name it
// first (tests/capabilities-contract.test.mjs enforces both directions).

export const STATUSES = ["supported", "partial", "missing"];
export const VERDICTS = ["buildable", "partial", "blocked"];

const fail = (path, why) => {
  throw new Error(`capabilities document: ${path} ${why}`);
};
const str = (v, path) => (typeof v === "string" ? v : fail(path, "must be a string"));
const arr = (v, path) => (Array.isArray(v) ? v : fail(path, "must be an array"));
const oneOf = (v, list, path) => (list.includes(v) ? v : fail(path, `must be one of ${list.join(", ")}`));

function readNeed(n, i) {
  const at = `needs[${i}]`;
  return {
    id: str(n.id, `${at}.id`),
    area: str(n.area, `${at}.area`),
    title: str(n.title, `${at}.title`),
    summary: str(n.summary, `${at}.summary`),
    status: oneOf(n.status, STATUSES, `${at}.status`),
    surface: arr(n.surface, `${at}.surface`).map((s, j) => ({
      kind: str(s.kind, `${at}.surface[${j}].kind`),
      name: str(s.name, `${at}.surface[${j}].name`),
    })),
    limits: arr(n.limits, `${at}.limits`).map((l, j) => str(l, `${at}.limits[${j}]`)),
    workaround: str(n.workaround ?? "", `${at}.workaround`),
    tags: arr(n.tags, `${at}.tags`).map((t, j) => str(t, `${at}.tags[${j}]`)),
  };
}

function readUseCase(u, i) {
  const at = `use_cases[${i}]`;
  const out = {
    id: str(u.id, `${at}.id`),
    title: str(u.title, `${at}.title`),
    summary: str(u.summary, `${at}.summary`),
    needs: arr(u.needs, `${at}.needs`).map((r, j) => ({
      id: str(r.id, `${at}.needs[${j}].id`),
      critical: r.critical === true,
      status: oneOf(r.status, STATUSES, `${at}.needs[${j}].status`),
    })),
    verdict: oneOf(u.verdict, VERDICTS, `${at}.verdict`),
  };
  if (u.optional_gaps !== undefined) {
    out.optional_gaps = arr(u.optional_gaps, `${at}.optional_gaps`).map((g, j) => ({
      id: str(g.id, `${at}.optional_gaps[${j}].id`),
      status: oneOf(g.status, STATUSES, `${at}.optional_gaps[${j}].status`),
    }));
  }
  return out;
}

/** Project a capabilities document onto the fields the skill names. */
export function readCapabilities(doc) {
  const meta = doc?.meta ?? fail("meta", "is required");
  return {
    meta: { schema: meta.schema, git_sha: str(meta.git_sha, "meta.git_sha"), doc_url: meta.doc_url },
    primitives: doc.primitives ?? fail("primitives", "is required"),
    needs: arr(doc.needs, "needs").map(readNeed),
    use_cases: arr(doc.use_cases, "use_cases").map(readUseCase),
  };
}

/** Optional gaps: the document's own list, else non-critical needs that are not supported. */
export function optionalGaps(useCase) {
  if (useCase.optional_gaps) return useCase.optional_gaps;
  return useCase.needs.filter((n) => !n.critical && n.status !== "supported").map(({ id, status }) => ({ id, status }));
}

/** Verdict for an idea with no matching use case: critical needs only. */
export function assessVerdict(criticalStatuses) {
  if (criticalStatuses.includes("missing")) return "blocked";
  if (criticalStatuses.includes("partial")) return "partial";
  return "buildable";
}
