# Queek AI Toolkit

Agent skills for building apps on [Queek](https://usequeek.com). They give your
coding agent accurate, source-checked knowledge of the install handoff,
webhooks, the app manifest, the embedded-app bridge, app review, and the typed
Merchant API.

Works with Claude Code and Codex, and with any other agent supported by the
[`skills`](https://www.npmjs.com/package/skills) CLI.

## Skills

| Skill | Use it to |
|---|---|
| `queek-capacity` | Check what the platform supports before you build. Reads the live capability docs and reports `buildable`, `partial`, or `blocked`. |
| `queek-app` | Handle install, uninstall, and settings handoffs; verify webhooks and app-proxy requests; call the Merchant API; request optional scopes. |
| `queek-manifest` | Write and validate `queek.app.toml`: scopes, webhooks, settings, extensions, and navigation. |
| `queek-bridge` | Build embedded app UI over the dashboard bridge: title bar, toast, save bar, navigation, resource picker, and theme mode. |
| `queek-review` | Pass the "Built for Queek" rule and the submission checklist. |
| `queek-types` | Keep Merchant API types current with `queek app codegen`. |

## Install

```sh
npx skills add usequeek/queek-ai-toolkit
```

Skills do not update automatically. To refresh them:

```sh
npx skills update
```

### Claude Code plugin

The repository is also a Claude Code plugin marketplace:

```text
/plugin marketplace add usequeek/queek-ai-toolkit
/plugin install queek-plugin@queek-ai-toolkit
```

### Codex plugin

Codex hosts that load plugins from a repository source can use
`.codex-plugin/plugin.json`, which points at the `skills/` directory.

## Try it

Once installed, ask your agent things like:

- "I want to build a loyalty-points app for Queek. Is it possible?"
- "How do I verify the Queek install handoff in a Next.js route?"
- "What scopes and nav items go in `queek.app.toml`?"
- "Send a toast over the Queek bridge."
- "What does the Built for Queek review check?"

## Accuracy

Every command, endpoint, and field named in a skill comes from the Queek SDK,
CLI, or API, and the references point to where you can check it. If the code
and a skill disagree, the code wins. Please
[open an issue](https://github.com/usequeek/queek-ai-toolkit/issues) when you
find a mismatch.

## Privacy

The toolkit collects nothing. No skill sends data anywhere, and there are no
hooks and no usage reporting. The test suite enforces this.

## Development

```sh
npm test
```

The suite checks that every skill has a valid `SKILL.md` and its reference
files, that the plugin manifests are consistent, and that nothing in the
repository can report telemetry. It also runs `scripts/check-public-text.mjs`,
which fails on internal references and secret-shaped strings; intentional
exceptions go in `.public-text-allow` with a reason.

## Related

- [Queek developer docs](https://docs.usequeek.com)
- [`@usequeek/app-sdk`](https://github.com/usequeek/app-sdk): the app SDK
- [`@usequeek/cli`](https://github.com/usequeek/theme-tools): the `queek` CLI

## License

[MIT](LICENSE)
