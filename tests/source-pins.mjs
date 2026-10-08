// Pinned source symbols. Every SDK/CLI/API symbol the skills depend on must
// exist in a checkout at the pinned SHA.
// Source roots come ONLY from TOOLKIT_SOURCE_ROOTS, either JSON:
//   TOOLKIT_SOURCE_ROOTS='{"sdk":"/path/to/app-sdk","cli":"/path/to/cli"}'
// or a comma-separated name=path list:
//   TOOLKIT_SOURCE_ROOTS='sdk=/path/to/app-sdk,cli=/path/to/cli'
// With no roots configured the guard SKIPS (a fresh clone passes with no
// checkouts). A configured root MUST satisfy both gates or the suite
// fails: `git rev-parse HEAD` in that root must equal the pin below, and
// every listed symbol must be present. On a pin mismatch, re-verify the
// skills against the new checkout state and bump the pin.
export function sourceRoots() {
  const raw = (process.env.TOOLKIT_SOURCE_ROOTS ?? "").trim();
  if (!raw) return {};
  if (raw.startsWith("{")) return JSON.parse(raw);
  const roots = {};
  for (const entry of raw.split(",")) {
    const cut = entry.indexOf("=");
    if (cut < 0) throw new Error(`Bad TOOLKIT_SOURCE_ROOTS entry (want name=path): ${entry}`);
    roots[entry.slice(0, cut).trim()] = entry.slice(cut + 1).trim();
  }
  return roots;
}

export const PINS = {
  sdk: "78a5b49fa504ddb47a58d08089f8d84142d3770d",
  cli: "aebd34bc7d7dc944993310d31ff0923bf0dc8748",
};

// {root, file, symbols[]} — files read from the working tree at the pin.
export const CHECKS = [
  { root: "sdk", file: "src/frame.ts", symbols: ["AppOutboundMessage", "AppInboundMessage", "BRIDGE_VERSION", "APP_SOURCE", "DASHBOARD_SOURCE", "MAX_HEADING_LENGTH", "MAX_TOAST_LENGTH", "MAX_PATH_LENGTH", "MAX_TARGET_LENGTH", "isAllowedOpenTarget", "parseInboundMessage", "parseOutboundMessage", "clipOutbound", "ResourceItem", "PickResourceRequest", "BridgeTheme", "resourceType", "sdkVersion"] },
  { root: "sdk", file: "src/browser.ts", symbols: ["installAuthFetch", "listenToDashboard", "sendReady", "applyTheme", "installThemeListener", "themeBootstrapScript", "THEME_PARAM", "LAUNCH_TOKEN_PARAM"] },
  { root: "sdk", file: "src/server.ts", symbols: ["verifySessionToken", "verifySessionTokenDetailed", "sessionTokenInstallationId", "EMBED_SECRET_PREFIX", "SESSION_CLOCK_TOLERANCE_SECONDS"] },
  { root: "sdk", file: "src/session.ts", symbols: ["verifySessionTokenDetailed", "SESSION_TOKEN_ALG", "SESSION_CLOCK_TOLERANCE_SECONDS", "sessionTokenInstallationId", "EMBED_SECRET_PREFIX", "binding_mismatch"] },
  { root: "sdk", file: "src/auth-fetch.ts", symbols: ["installAuthFetch", "LAUNCH_TOKEN_PARAM", "readLaunchToken", "stripLaunchToken", "BRIDGE_TOKEN_TIMEOUT_MS", "queek_token"] },
  { root: "sdk", file: "src/theme.ts", symbols: ["applyTheme", "installThemeListener", "themeBootstrapScript", "THEME_PARAM", "THEME_STORAGE_KEY", "getThemeModeFromUrl", "syncThemeUrl"] },
  { root: "sdk", file: "src/scopes.ts", symbols: ["createInstallationScopesClient", "queryScopes", "requestScopes", "revokeScopes", "buildScopeRequestLink", "splitInstallationScopes", "AppScopeRequiredError", "normaliseScopeList", "revokeScopesPath", "InstallationScopesClient"] },
  { root: "sdk", file: "src/signatures.ts", symbols: ["secretKeyBytes", "verifyQueekSignature", "signQueekPayload", "MAX_TIMESTAMP_SKEW_SECONDS", "SECRET_PREFIX", "v1,"] },
  { root: "sdk", file: "src/proxy.ts", symbols: ["signProxyQuery", "buildProxyCanonicalString", "PROXY_KID_PARAM", "PROXY_NONCE_PARAM", "verifyProxyQuery", "proxySkewExceeded", "timingSafeEqual", "verifyProxyDelivery", "handleProxyRequest", "method_not_allowed"] },
  { root: "sdk", file: "src/handoff.ts", symbols: ["InstallData", "webhook_secret", "proxy_secret", "embed_secret", "INSTALL_EVENT", "SCOPES_UPDATE_EVENT", "app/resync", "app/scopes_update"] },
  { root: "sdk", file: "src/install-handlers.ts", symbols: ["guard", "buildInstallationRecord", "handleInstallDelivery", "handleInstallRequest", "saveResyncedInstallation", "saveScopesUpdateInstallation", "install_failed", "uninstall_failed", "settings_failed", "unknown_route", "method_not_allowed"] },
  { root: "sdk", file: "src/app-auth.ts", symbols: ["loadAppCredential", "APP_PRIVATE_KEY", "APP_KEY_ID", "APP_SLUG", "APP_JWT_SKEW_SECONDS", "APP_JWT_TTL_SECONDS", "TOKEN_VALIDITY_SKEW_SECONDS", "invalid_client", "app_token_revoked", "app_installation_gone", "app_installation_pending", "resync_cooldown", "too_many_requests"] },
  { root: "sdk", file: "src/hono.ts", symbols: ["createInstallHandlers", "createWebhookHandler", "createProxyHandler"] },
  { root: "sdk", file: "src/react.ts", symbols: ["QueekProvider", "useQueek"] },
  { root: "sdk", file: "src/logger.ts", symbols: ["REDACTED", "whsec_", "sk_(live|test)_"] },
  { root: "sdk", file: "src/client.ts", symbols: ["X-Client-Key", "Idempotency-Key", "newIdempotencyKey", "createQueekClient", "QueekApiError", "isWriteMethod", "idempotencyKey"] },
  { root: "sdk", file: "src/tokens.ts", symbols: ["createInstallationClient", "acquireToken", "createAppTokenProvider", "APP_API_PATH", "mintPath"] },
  { root: "sdk", file: "src/resync.ts", symbols: ["resyncFromQueek"] },
  { root: "sdk", file: "src/webhooks.ts", symbols: ["unhandled"] },
  { root: "cli", file: "src/commands/app/deploy.ts", symbols: ["signing_secret", ".env.local", "QUEEK_APP_SECRET"] },
  { root: "cli", file: "src/commands/app/codegen.ts", symbols: ["AppCodegen", "types/merchant.ts", "codegen.json", "runCodegen"] },
  { root: "sdk", file: "scripts/gen-merchant-types.mjs", symbols: ["/orders/import", "openapi-typescript", "scramble:export --api=merchant"] },
  { root: "cli", file: "src/lib/app-manifest.ts", symbols: ["TOP_LEVEL_TOML_KEYS", "MANIFEST_KEYS", "optional_scopes", "demo_url", "video_url", "checkNav", "checkExtensions", "checkCappedUrl", "isAllowedVideoHost", "secretProblem", "unknownField", "Unknown field", "EXTENSION_KEYS"] },
];