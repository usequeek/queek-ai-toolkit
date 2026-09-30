// Pinned load-bearing symbols (MUST-7). Every backticked SDK/CLI/backend
// symbol the skills cite must exist in the pinned checkout. Roots default
// to the author's checkouts; override with TOOLKIT_SOURCE_ROOTS as JSON:
// {"sdk": "/path/app-sdk-wt-bridge", "cli": "/path/cli", "backend": "...",
//  "booking": "..."}. Backend files read from `ref` (default origin/master)
// via `git show` so a stale working tree cannot mask drift. Missing roots
// SKIP (public hosts lack checkouts); present roots MUST contain every
// symbol or the suite fails.
export const DEFAULT_ROOTS = {
  sdk: "/Users/benny/Documents/products/split/app-sdk-wt-bridge",
  cli: "/Users/benny/Documents/products/packages/theme-tools-wt-app/packages/cli",
  backend: "/Users/benny/Documents/laravel/queek_backend",
  booking: "/Users/benny/Documents/products/queek-app-booking",
};

export const PINS = {
  sdk: "df72a4863cc5481f04d1f6adb8d4b970a8c1124f",
  cli: "cc97789ffeb303a949024284b7723924027c0d1b",
  backend: "4c8a56cb64edaa7a3beb735eade3dd033328c8db",
};

// {root, file, ref?, symbols[]} — ref set reads via `git show <ref>:<file>`.
export const CHECKS = [
  { root: "sdk", file: "src/frame.ts", symbols: ["AppOutboundMessage", "AppInboundMessage", "BRIDGE_VERSION", "APP_SOURCE", "DASHBOARD_SOURCE", "MAX_HEADING_LENGTH", "isAllowedOpenTarget", "parseInboundMessage", "clipOutbound", "resourceType", "sdkVersion"] },
  { root: "sdk", file: "src/signatures.ts", symbols: ["secretKeyBytes", "verifyQueekSignature", "signQueekPayload", "MAX_TIMESTAMP_SKEW_SECONDS", "SECRET_PREFIX", "v1,"] },
  { root: "sdk", file: "src/proxy.ts", symbols: ["signProxyQuery", "buildProxyCanonicalString", "PROXY_KID_PARAM", "verifyProxyDelivery", "handleProxyRequest", "method_not_allowed"] },
  { root: "sdk", file: "src/handoff.ts", symbols: ["InstallData", "webhook_secret", "proxy_secret", "embed_secret", "INSTALL_EVENT", "app/resync"] },
  { root: "sdk", file: "src/install-handlers.ts", symbols: ["guard", "buildInstallationRecord", "handleInstallDelivery", "handleInstallRequest", "saveResyncedInstallation", "install_failed", "uninstall_failed", "settings_failed", "unknown_route", "method_not_allowed"] },
  { root: "sdk", file: "src/app-auth.ts", symbols: ["loadAppCredential", "APP_PRIVATE_KEY", "APP_KEY_ID", "APP_SLUG", "APP_JWT_SKEW_SECONDS", "APP_JWT_TTL_SECONDS", "TOKEN_VALIDITY_SKEW_SECONDS", "invalid_client", "app_token_revoked", "app_installation_gone", "app_installation_pending", "resync_cooldown", "too_many_requests"] },
  { root: "sdk", file: "src/session.ts", symbols: ["verifySessionToken", "verifyLaunchToken", "sessionTokenInstallationId", "SESSION_CLOCK_TOLERANCE_SECONDS", "EMBED_SECRET_PREFIX"] },
  { root: "sdk", file: "src/server.ts", symbols: ["verifySessionToken", "verifyLaunchToken"] },
  { root: "sdk", file: "src/hono.ts", symbols: ["createInstallHandlers", "createWebhookHandler", "createProxyHandler"] },
  { root: "sdk", file: "src/react.ts", symbols: ["QueekProvider", "useQueek"] },
  { root: "sdk", file: "src/logger.ts", symbols: ["REDACTED", "whsec_", "sk_(live|test)_"] },
  { root: "sdk", file: "src/client.ts", symbols: ["X-Client-Key", "Idempotency-Key", "newIdempotencyKey", "createQueekClient", "QueekApiError", "isWriteMethod", "idempotencyKey"] },
  { root: "sdk", file: "src/tokens.ts", symbols: ["createInstallationClient", "acquireToken", "createAppTokenProvider", "APP_API_PATH", "mintPath"] },
  { root: "sdk", file: "src/resync.ts", symbols: ["resyncFromQueek"] },
  { root: "sdk", file: "src/webhooks.ts", symbols: ["unhandled"] },
  { root: "cli", file: "src/commands/app/deploy.ts", symbols: ["signing_secret", ".env.local", "QUEEK_APP_SECRET"] },
  { root: "cli", file: "src/commands/app/codegen.ts", symbols: ["AppCodegen", "types/merchant.ts", "codegen.json"] },
  { root: "sdk", file: "scripts/gen-merchant-types.mjs", symbols: ["/orders/import", "openapi-typescript", "scramble:export --api=merchant"] },
  { root: "cli", file: "src/lib/app-manifest.ts", symbols: ["TOP_LEVEL_TOML_KEYS", "MANIFEST_KEYS", "checkNav", "checkExtensions", "Unknown field"] },
  { root: "booking", file: "queek.app.toml", symbols: ["[[extensions.nav]]", "merchant_page_url", "[[extensions.blocks]]"] },
  { root: "backend", file: "app/Services/Apps/SubmissionCheckService.php", ref: "origin/master", symbols: ["CHECK_LISTING", "CHECK_TESTED", "CHECK_ENDPOINTS", "CHECK_EMBEDDED_FRAME", "CHECK_DEMO_PRESENCE", "LEVEL_ERROR", "LEVEL_WARNING", "FRESHNESS_HOURS", "WARNING_KEYS", "CHECK_LABELS", "function evaluate", "storedFresh", "isFresh", "listingCheck", "listingMessage", "testedCheck", "embeddedMessage"] },
  { root: "backend", file: "routes/vendor-api.php", ref: "origin/master", symbols: ["apps/{app}/versions/{sequence}/submission", "apps/{app}/versions/{sequence}/withdraw", "apps/{app}/submit"] },
  { root: "backend", file: "app/Http/Controllers/Api/Vendor/Developer/DeveloperAppController.php", ref: "origin/master", symbols: ["public function submission", "public function submitVersion", "public function withdraw", "public function submit"] },
  { root: "backend", file: "app/Services/Apps/AppManifestValidator.php", ref: "origin/master", symbols: ["topLevelKeys", "demo_url", "video_url", "rejectUnknown"] },
  { root: "backend", file: "config/scramble.php", ref: "origin/master", symbols: ["API_VERSION"] },
  { root: "backend", file: "app/Support/Api/ApiContract.php", ref: "origin/master", symbols: ["VERSION_HEADER", "X-Queek-Api-Version"] },
  { root: "backend", file: "app/Providers/ScrambleServiceProvider.php", ref: "origin/master", symbols: ["SPEC_SHA_FIELD", "freshness pin"] },
  { root: "backend", file: "app/Support/Docs/ApiScopes.php", ref: "origin/master", symbols: ["SPEC_SHA_FIELD", "x-queek-spec-sha"] },
];
