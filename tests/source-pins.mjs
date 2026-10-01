// Pinned load-bearing symbols (MUST-7). Every backticked SDK/CLI/backend
// symbol the skills cite must exist in the pinned checkout. Roots default
// to the author's checkouts; override with TOOLKIT_SOURCE_ROOTS as JSON:
// {"sdk": "/path/app-sdk-wt-scopes", "cli": "/path/cli", "backend": "...",
//  "booking": "..."}. Files read from the working tree at the pinned SHA.
// Missing roots SKIP (public hosts lack checkouts); present roots MUST
// contain every symbol or the suite fails.
export const DEFAULT_ROOTS = {
  sdk: "/Users/benny/Documents/products/split/app-sdk-wt-scopes",
  cli: "/Users/benny/Documents/products/packages/theme-tools-wt-rel/packages/cli",
  backend: "/Users/benny/Documents/laravel/queek_backend-wt-singletoken",
  booking: "/Users/benny/Documents/products/queek-app-booking",
};

export const PINS = {
  sdk: "78a5b49fa504ddb47a58d08089f8d84142d3770d",
  cli: "aebd34bc7d7dc944993310d31ff0923bf0dc8748",
  backend: "bbc82ecbfc0dfd6341b86af0cfaeab6984b8f2df",
};

// {root, file, ref?, symbols[]} — ref set reads via `git show <ref>:<file>`.
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
  { root: "booking", file: "queek.app.toml", symbols: ["[[extensions.nav]]", "merchant_page_url", "[[extensions.blocks]]"] },
  { root: "backend", file: "app/Services/Apps/SubmissionCheckService.php", symbols: ["CHECK_LISTING", "CHECK_TESTED", "CHECK_ENDPOINTS", "CHECK_EMBEDDED_FRAME", "CHECK_DEMO_PRESENCE", "LEVEL_ERROR", "LEVEL_WARNING", "FRESHNESS_HOURS", "WARNING_KEYS", "CHECK_LABELS", "function evaluate", "storedFresh", "isFresh", "listingCheck", "listingMessage", "testedCheck", "embeddedMessage"] },
  { root: "backend", file: "routes/vendor-api.php", symbols: ["apps/{app}/versions/{sequence}/submission", "apps/{app}/versions/{sequence}/withdraw", "apps/{app}/submit", "vendor/app-store/{slug}/scopes/approve"] },
  { root: "backend", file: "routes/app-api.php", symbols: ["installations/{installation}/scopes/revoke"] },
  { root: "backend", file: "app/Http/Controllers/Api/Vendor/Developer/DeveloperAppController.php", symbols: ["public function submission", "public function submitVersion", "public function withdraw", "public function submit"] },
  { root: "backend", file: "app/Http/Controllers/Api/Vendor/VendorAppController.php", symbols: ["public function approveScopes"] },
  { root: "backend", file: "app/Http/Controllers/Api/Apps/AppInstallationController.php", symbols: ["public function revokeScopes"] },
  { root: "backend", file: "app/Services/Apps/AppManifestValidator.php", symbols: ["topLevelKeys", "demo_url", "video_url", "rejectUnknown", "optional_scopes"] },
  { root: "backend", file: "config/scramble.php", symbols: ["API_VERSION"] },
  { root: "backend", file: "app/Support/Api/ApiContract.php", symbols: ["VERSION_HEADER", "X-Queek-Api-Version"] },
  { root: "backend", file: "app/Providers/ScrambleServiceProvider.php", symbols: ["SPEC_SHA_FIELD", "freshness pin"] },
  { root: "backend", file: "app/Support/Docs/ApiScopes.php", symbols: ["SPEC_SHA_FIELD", "x-queek-spec-sha"] },
];
