import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const skillsDir = join(root, "skills");

const EXPECTED_SKILLS = [
  "queek-app",
  "queek-manifest",
  "queek-bridge",
  "queek-review",
  "queek-types",
];

const EXPECTED_REFS = {
  "queek-app": ["install-handoff.md", "webhooks.md", "merchant-client.md"],
  "queek-manifest": ["manifest-shape.md", "manifest-rules.md"],
  "queek-bridge": ["messages.md", "bridge-spec.md", "theme-mode.md"],
  "queek-review": ["built-for-queek.md", "submission-checklist.md"],
  "queek-types": ["codegen.md", "freshness.md"],
};

test("all five skills exist with SKILL.md + references/", () => {
  const found = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  assert.deepEqual(found, [...EXPECTED_SKILLS].sort());
  for (const skill of EXPECTED_SKILLS) {
    assert.ok(existsSync(join(skillsDir, skill, "SKILL.md")), `${skill}/SKILL.md`);
    for (const ref of EXPECTED_REFS[skill]) {
      assert.ok(existsSync(join(skillsDir, skill, "references", ref)), `${skill}/references/${ref}`);
    }
  }
});

test("every SKILL.md carries name + description frontmatter", () => {
  for (const skill of EXPECTED_SKILLS) {
    const body = read(`skills/${skill}/SKILL.md`);
    assert.match(body, /^---\nname: \S+\ndescription: ".+"\n/m, `${skill} frontmatter`);
  }
});

test("every reference file cites the source file it came from", () => {
  for (const skill of EXPECTED_SKILLS) {
    for (const ref of EXPECTED_REFS[skill]) {
      const body = read(`skills/${skill}/references/${ref}`);
      assert.match(
        body,
        /(app-sdk-wt-bridge|theme-tools-wt-app|queek-app-booking|queek_backend)/,
        `${skill}/${ref} names its source repo`,
      );
      assert.match(
        body,
        /`[\w./-]+\.(ts|md|php|toml|mjs)(:\d+(-\d+)?)?`/,
        `${skill}/${ref} cites a source file`,
      );
    }
  }
});

test("plugin manifests parse and name the same plugin", () => {
  for (const file of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", "plugin.json"]) {
    const manifest = JSON.parse(read(file));
    assert.equal(manifest.name, "queek-plugin", file);
    assert.equal(manifest.license, "MIT", file);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/, `${file} semver`);
  }
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  assert.equal(marketplace.plugins[0].name, "queek-plugin");
});

test("zero telemetry: no posting, tracking, or usage-reporting surface", () => {
  const banned = [
    /fetch\s*\(/i,
    /https?:\/\/[^/\s]+\/(mcp\/usage|telemetry|track|collect|analytics)/i,
    /OPT_OUT_INSTRUMENTATION/i,
    /PostToolUse/i,
    /\bhooks\s*:/i,
  ];
  const walk = (dir, out = []) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, out);
      else if (/\.(md|json|mjs|js|sh)$/.test(entry.name)) out.push(full);
    }
    return out;
  };
  const files = walk(skillsDir)
    .concat([
      join(root, "plugin.json"),
      join(root, ".claude-plugin", "plugin.json"),
      join(root, ".claude-plugin", "marketplace.json"),
      join(root, ".codex-plugin", "plugin.json"),
    ])
    .filter((f) => !/tests\//.test(f));
  assert.ok(files.length > 10, "scans a real file set");
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    for (const pattern of banned) {
      assert.doesNotMatch(body, pattern, `${file} matches ${pattern}`);
    }
  }
});

test("docs URLs mentioned in skills resolve to real contract hosts", () => {
  const bodies = EXPECTED_SKILLS.flatMap((skill) =>
    EXPECTED_REFS[skill].map((ref) => read(`skills/${skill}/references/${ref}`)),
  ).join("\n");
  const urls = [...bodies.matchAll(/https:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]);
  const allowed = new Set(["api.usequeek.com", "booking.apps.queek.com.ng", "github.com"]);
  for (const host of new Set(urls)) {
    assert.ok(allowed.has(host), `unexpected external host: ${host}`);
  }
});
