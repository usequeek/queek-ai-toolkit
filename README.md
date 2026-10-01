# Queek AI Toolkit

Agent skills for building Queek apps — the one central toolkit, mirrored on
[Shopify's `shopify-ai-toolkit`](https://github.com/Shopify/shopify-ai-toolkit)
layout (`skills/<name>/SKILL.md` + `references/`, per-host plugin manifests).
Scaffolded apps carry only an `AGENTS.md` pointer to this repo; skills are
never vendored into SDKs or apps.

Public, MIT. **Zero telemetry**: no skill posts anywhere, no hooks, no
opt-out flag to set — there is nothing to opt out of. (Shopify's default-on
usage posts to `shopify.dev` were deliberately not copied.)

Public at `github.com/usequeek/queek-ai-toolkit` — the install commands
below assume that URL. `package.json` stays `private: true` on purpose:
public here means git distribution, not npm — the flag only blocks an
accidental `npm publish`. The `skills` CLI mechanism itself was verified
(`npx skills --help` lists `add` + `update`). Scaffolded apps carry only
an `AGENTS.md` pointer to this repo; skills are never vendored into SDKs
or apps.

## Skills

| Skill | What it covers | Sources (only real docs) |
|---|---|---|
| `queek-app` | Install/uninstall/settings handoff (verify first), Standard Webhooks + app-proxy verification (`whsec_`), Merchant API client (`X-Client-Key`, `Idempotency-Key`), optional scopes, single-token embedded auth | SDK `README.md`, `src/install-handlers.ts`, `src/handoff.ts`, `src/proxy.ts`, `src/client.ts`, `src/signatures.ts`, `src/scopes.ts`, `src/session.ts` |
| `queek-manifest` | `queek.app.toml` shape, required + optional scopes, `[[extensions.nav]]`, blocks, dashboard blocks, proxy | CLI `src/lib/app-manifest.ts` (`usequeek/theme-tools`), the Queek API (docs.usequeek.com) manifest validator |
| `queek-bridge` | Typed bridge messages, handshake + capabilities, picker, theme mode | SDK `src/frame.ts`, `src/theme.ts`, `app-ui-kit.md` (bridge v1, U7) |
| `queek-review` | "Built for Queek" rule + submission checklist `{key, level, ok, detail}` | `app-ui-kit.md` (U5), `app-review-submission-flow.md` (item 4) |
| `queek-types` | `queek app codegen` flow (CLI 0.14.0), manual freshness rule | CLI `src/commands/app/codegen.ts`, backend `config/scramble.php`, `ApiContract.php` |

Every command, endpoint, and field named in a skill exists in the cited
source file. If the code disagrees with a skill, the code wins.

## Install

Skills update manually — there is no auto-update channel. After updating,
re-run the install command for your host.

### Claude Code

Standalone skills (recommended):

```sh
npx skills add usequeek/queek-ai-toolkit
```

Refresh later with:

```sh
npx skills update
```

The repo also ships a Claude plugin manifest (`.claude-plugin/`:
`plugin.json` + `marketplace.json`, plugin `queek-plugin`) for hosts that
install from a plugin marketplace or local source.

### Codex

Standalone skills (recommended):

```sh
npx skills add usequeek/queek-ai-toolkit
```

Refresh later with:

```sh
npx skills update
```

The repo also ships a Codex plugin manifest (`.codex-plugin/plugin.json`,
plugin `queek-plugin`, `skills: ./skills/`) for hosts that load Codex
plugins from a repo source.

## Layout

```text
skills/queek-app/SKILL.md + references/
skills/queek-manifest/SKILL.md + references/
skills/queek-bridge/SKILL.md + references/
skills/queek-review/SKILL.md + references/
skills/queek-types/SKILL.md + references/
.claude-plugin/   Claude plugin manifest (queek-plugin)
.codex-plugin/    Codex plugin manifest (queek-plugin)
plugin.json       shared plugin metadata
tests/            structural + zero-telemetry tests (npm test)
```

Cursor/Gemini manifests ship only if they cost nothing — they are out of
scope for v0.1.0 (plan T2).

## Test

```sh
npm test
```

Runs the structural suite: all five skills present with `SKILL.md` +
`references/`, frontmatter valid, every reference cites its source file,
manifests parse, and zero telemetry (no posting/tracking surface anywhere
in skills or manifests).
