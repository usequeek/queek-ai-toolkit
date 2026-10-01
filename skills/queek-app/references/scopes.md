# Optional scopes

Sources: `@usequeek/app-sdk` `src/scopes.ts`
(`createInstallationScopesClient`, `queryScopes`, `requestScopes`,
`revokeScopes`, `buildScopeRequestLink`, `splitInstallationScopes`,
`AppScopeRequiredError`, `normaliseScopeList`, `revokeScopesPath`),
`src/handoff.ts` (`SCOPES_UPDATE_EVENT`, `ScopesUpdateData`,
`ScopesUpdateEnvelope`), `src/install-handlers.ts`
(`saveScopesUpdateInstallation`), `README.md` (§ Scopes);
the Queek API (docs.usequeek.com) `app/Services/Apps/AppManifestValidator.php`
(`optional_scopes`, disjoint from `scopes`),
`routes/vendor-api.php` (`vendor/app-store/{slug}/scopes/approve`),
`routes/app-api.php` (`installations/{installation}/scopes/revoke`).
(Repos: `usequeek/app-sdk`, the Queek API (docs.usequeek.com).)

Apps declare required scopes (granted at install) plus `optional_scopes`
(requested later, revocable) under `[access]` in the manifest (see the
`queek-manifest` skill). Install grants required only.

## The per-installation scopes session

`createInstallationScopesClient({ installationId, store, signJwt,
optionalScopes, appSlug, dashboardOrigin })` — a sibling of the
installation client, wired to the same store + token provider
(`src/scopes.ts`, `InstallationScopesClient`).

- `queryScopes()` reads the cached grant split against the app's own
  declared-optional list: `{ granted, optional }`. Store-read only, never
  a network call (`splitInstallationScopes`).
- `requestScopes([...])` builds the dashboard consent link (pure — the SDK
  never renders consent): `/apps?app=<slug>&view=scopes&scopes=<csv>`
  (`buildScopeRequestLink`), dashboard-relative or absolute under
  `dashboardOrigin`. Open it via the bridge `sendOpen` (see the
  `queek-bridge` skill) or a redirect; the merchant consents in the
  dashboard.
- `revokeScopes([...])` posts the app-authenticated revoke
  (`revokeScopesPath`, `POST
  installations/{installation}/scopes/revoke`) and refreshes the cached
  grant, dropping the cached token when the grant moved. Revoke is
  app-initiated only — required scopes refuse 422 `app_scope_required`
  (`AppScopeRequiredError`); revoking a never-granted optional scope is a
  200 with no change. The merchant's remedy for required scopes is
  uninstall.

## The app learns over the signed handoff

Grant changes arrive as the signed `app/scopes_update` handoff
(`SCOPES_UPDATE_EVENT`), carried on the install/settings handlers like a
resync: the cached grant refreshes (`saveScopesUpdateInstallation`) and
the cached token drops when the grant moved (`src/install-handlers.ts`).
Approve lands on `POST vendor/app-store/{slug}/scopes/approve` (merchant
consent-screen action, declared-optional scopes only — anything undeclared
in the live manifest version refuses 422).
