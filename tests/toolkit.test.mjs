import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceRoots, PINS, CHECKS } from "./source-pins.mjs";

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
  "queek-app": ["install-handoff.md", "webhooks.md", "merchant-client.md", "scopes.md"],
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
        /(usequeek\/app-sdk|usequeek\/theme-tools|usequeek\/queek-app-starter|Queek API)/,
        `${skill}/${ref} names its public source`,
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

test("MUST-1: topic decode vs proxy full-string are split, never mixed", () => {
  const body = read("skills/queek-app/references/webhooks.md");
  assert.match(body, /DIFFERENTLY/, "warns the derivations differ");
  assert.match(body, /secretKeyBytes/, "topic cites the decoder");
  assert.match(body, /signProxyQuery/, "proxy cites the hex signer");
  const topicSection = body.split("## App proxy")[0];
  assert.match(topicSection, /DECODED secret bytes/, "topic heading states decode");
  assert.doesNotMatch(topicSection, /FULL/, "topic section never claims full-string");
  assert.doesNotMatch(read("skills/queek-app/SKILL.md"), /never base64-decode/i, "skill rule fixed");
});

test("MUST-2: handoff names the three secrets, denies only tokens", () => {
  const body = read("skills/queek-app/references/install-handoff.md");
  for (const secret of ["webhook_secret", "proxy_secret", "embed_secret"]) {
    assert.match(body, new RegExp(secret), `names ${secret}`);
  }
  assert.match(body, /No store-callable \*token\*/, "narrowed to tokens");
  assert.doesNotMatch(body, /no per-installation secrets cross/i, "false claim gone");
});

test("MUST-3: submit routes cite origin/master by symbol with version-scoped endpoints", () => {
  const body = read("skills/queek-review/references/submission-checklist.md");
  for (const s of ["apps/{app}/submit", "versions/{sequence}/submission", "versions/{sequence}/submit", "versions/{sequence}/withdraw", "submitVersion", "withdraw", "::submission", "::submit", "SubmissionCheckService", "FRESHNESS"]) {
    assert.ok(body.includes(s), `cites ${s}`);
  }
  assert.doesNotMatch(body, /vendor-api\.php:\d/, "no driftable route line numbers");
  assert.doesNotMatch(body, /vendor-api\.php:1049/, "stale working-tree line gone");
});

test("MUST-4: bridge marks dashboard behavior PLANNED, uses exact field names", () => {
  const body = read("skills/queek-bridge/references/bridge-spec.md");
  assert.match(body, /PLANNED/, "dashboard half marked planned");
  assert.match(body, /resourceType/, "exact picker field name");
  assert.match(body, /sdkVersion/, "ready carries sdkVersion");
  assert.match(body, /BRIDGE_VERSION/, "dashboard version constant");
  assert.doesNotMatch(body, /\{\s*type:\s*'product'\s*\}/, "wrong shape gone");
});

test("MUST-5: manifest lists all keys, mirrors the 28-key shape, labels trimming", () => {
  const rules = read("skills/queek-manifest/references/manifest-rules.md");
  for (const key of ["handle", "version", "distribution", "icon", "developer", "category", "dashboard", "dev", "demo_url", "video_url", "optional_scopes"]) {
    assert.match(rules, new RegExp(`\`${key}\``), `rules list ${key}`);
  }
  assert.match(rules, /28/, "flattened mirror count stated");
  assert.match(rules, /disjoint/, "required/optional disjointness stated");
  assert.match(rules, /checkDashboard/, "dashboard blocks covered");
  assert.doesNotMatch(rules, /27 top-level keys/, "stale 27-count gone");
  assert.doesNotMatch(rules, /GAP/, "gap history gone");
  assert.match(read("skills/queek-manifest/references/manifest-shape.md"), /TRIMMED/, "trimming labeled");
  assert.match(read("skills/queek-manifest/references/manifest-shape.md"), /optional_scopes/, "shape shows the access table");
});

test("MUST-6: additive is plan policy plus served spec text, B1/B2 pinned", () => {
  const fresh = read("skills/queek-types/references/freshness.md");
  assert.match(fresh, /POLICY/, "additive labeled policy");
  assert.match(fresh, /\(B2\)/, "B2 pin stated");
  assert.match(fresh, /\(B1\)/, "B1 pin stated");
  assert.match(fresh, /x-queek-spec-sha/, "hash pin named");
  assert.match(fresh, /ScrambleServiceProvider/, "hash header source cited");
  assert.doesNotMatch(fresh, /unlanded/, "no stale unlanded claims remain");
  assert.doesNotMatch(fresh, /landed/, "no release-history prose");
  assert.match(read("skills/queek-types/SKILL.md"), /POLICY/, "skill echoes policy framing");
  assert.match(read("skills/queek-types/SKILL.md"), /queek app codegen/, "skill names the released path");
});

test("MUST-7: every cited symbol exists in pinned checkouts", (t) => {
  const roots = sourceRoots();
  const pinned = new Set();
  let checked = 0;
  const skipped = [...new Set(CHECKS.map((c) => c.root))].filter((r) => !roots[r]);
  for (const { root, file, symbols } of CHECKS) {
    const repo = roots[root];
    if (!repo) continue;
    if (!pinned.has(root)) {
      const head = execSync(`git -C ${JSON.stringify(repo)} rev-parse HEAD`, { encoding: "utf8", timeout: 30000 }).trim();
      assert.equal(head, PINS[root], `${root} is at ${head}, not the pinned ${PINS[root]} — re-verify the skills and bump the pin`);
      pinned.add(root);
    }
    const body = readFileSync(join(repo, file), "utf8");
    for (const symbol of symbols) {
      assert.ok(body.includes(symbol), `${root}:${file} contains ${symbol}`);
      checked += 1;
    }
  }
  t.diagnostic(`symbols checked: ${checked}, roots skipped: ${skipped.join(", ") || "none"} (pins: ${Object.values(PINS).map((s) => s.slice(0, 8)).join(", ")})`);
  if (checked === 0) t.skip("no source roots configured — set TOOLKIT_SOURCE_ROOTS (see tests/source-pins.mjs) to enable the symbol guard");
});

test("no private paths anywhere in tracked files", () => {
  const wt = "wt";
  const who = "ben" + "ny";
  const banned = [/\/Users\//, new RegExp(`-${wt}-`), /\/home\//, new RegExp(who, "i")];
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
      join(root, "README.md"),
      join(root, "plugin.json"),
      join(root, ".claude-plugin", "plugin.json"),
      join(root, ".claude-plugin", "marketplace.json"),
      join(root, ".codex-plugin", "plugin.json"),
      ...walk(join(root, "tests")),
    ])
    .filter((f) => existsSync(f));
  assert.ok(files.length > 10, "scans a real file set");
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    for (const pattern of banned) {
      assert.doesNotMatch(body, pattern, `${file} leaks a private path`);
    }
  }
});

test("MUST-8: README states the public-repo install status honestly", () => {
  const body = read("README.md");
  assert.match(body, /github\.com\/usequeek\/queek-ai-toolkit/, "public repo named");
  assert.match(body, /npx skills add usequeek\/queek-ai-toolkit/, "skills-add route documented");
  assert.match(body, /npx skills update/, "manual update documented");
  assert.doesNotMatch(body, /not yet published/i, "stale unpublished claim gone");
});

test("codegen is released in CLI 0.14.0 and runnable", () => {
  const codegen = read("skills/queek-types/references/codegen.md");
  assert.match(codegen, /RELEASED/, "released status stated");
  assert.match(codegen, /0\.14\.0/, "released version cited");
  assert.match(codegen, /queek app codegen/, "runnable command named");
  assert.match(codegen, /packages\/cli\/src\/commands\/app\/codegen\.ts/, "implementation file cited");
  assert.match(codegen, /AppCodegen/, "command class cited");
  assert.match(codegen, /types\/merchant\.ts/, "output file cited");
  assert.match(codegen, /codegen\.json/, "record file cited");
  assert.doesNotMatch(codegen, /UNRELEASED/, "stale unreleased claim gone");
  assert.doesNotMatch(codegen, /feat\/queek-app/, "branch home gone");
  assert.doesNotMatch(codegen, /39b0bb6/, "branch tip gone");
  assert.doesNotMatch(codegen, /PR #9/, "PR cite gone");
  assert.doesNotMatch(codegen, /0\.13\.0/, "old version gone");
  assert.doesNotMatch(codegen, /never tell an agent to run/, "no-run instruction gone");
  const fresh = read("skills/queek-types/references/freshness.md");
  assert.match(fresh, /queek app codegen/, "freshness names the released path");
  assert.match(fresh, /0\.14\.0/, "freshness cites the released version");
  assert.doesNotMatch(fresh, /feat\/queek-app/, "freshness branch cite gone");
  assert.doesNotMatch(fresh, /0\.13\.0/, "freshness old version gone");
});

test("auth is one session token with one verifier, no launch/purpose split", () => {
  const handoff = read("skills/queek-app/references/install-handoff.md");
  for (const s of ["queek_token", "verifySessionTokenDetailed", "installAuthFetch", "sessionTokenInstallationId", "@usequeek/app-sdk/browser", "@usequeek/app-sdk/server"]) {
    assert.ok(handoff.includes(s), `handoff names ${s}`);
  }
  assert.doesNotMatch(handoff, /verifyLaunchToken/, "launch verifier gone");
  assert.doesNotMatch(handoff, /purpose/, "purpose split gone");
  const skill = read("skills/queek-app/SKILL.md");
  assert.match(skill, /@usequeek\/app-sdk\/browser/, "entry table lists /browser");
  assert.match(skill, /verifySessionTokenDetailed/, "entry table lists the single verifier");
  assert.doesNotMatch(skill, /verifyLaunchToken/, "entry table drops the launch verifier");
  assert.match(read("skills/queek-bridge/references/theme-mode.md"), /THEME_PARAM/, "theme cites the unsigned param");
  assert.doesNotMatch(read("skills/queek-bridge/references/theme-mode.md"), /resolvedTheme/, "dashboard-render claim gone");
});

test("optional scopes name the manifest key, the session, the handoff, and the consent link", () => {
  const scopes = read("skills/queek-app/references/scopes.md");
  for (const s of ["optional_scopes", "queryScopes", "requestScopes", "revokeScopes", "createInstallationScopesClient", "app/scopes_update", "/apps?app=<slug>&view=scopes&scopes=<csv>", "app-initiated only"]) {
    assert.ok(scopes.includes(s), `scopes names ${s}`);
  }
  assert.match(read("skills/queek-manifest/references/manifest-rules.md"), /optional_scopes/, "rules cover the manifest key");
});

test("no driftable file:line source cites anywhere under skills/", () => {
  // Symbol-only citations: a backticked `file.ext:<digits>` cite rots on
  // every edit, so every reference file must cite file + symbol/const/
  // function name instead. This scans every markdown file under skills/
  // (SKILL.md + references/) and fails on any backticked source cite with
  // a line number.
  const lineCite = /`[\w./-]+\.(ts|md|php|toml|mjs|json):\d/;
  const walk = (dir, out = []) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, out);
      else if (/\.md$/.test(entry.name)) out.push(full);
    }
    return out;
  };
  const files = walk(skillsDir);
  assert.ok(files.length >= 15, "scans a real file set");
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    assert.doesNotMatch(body, lineCite, `${file} carries a driftable :<digits> cite`);
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
