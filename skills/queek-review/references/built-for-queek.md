# Built for Queek review rule

Source: the Queek API (docs.usequeek.com) plan `app-ui-kit.md`, item U5
('"Built for Queek" review rule').

Embedded pages use the Queek theme and the bridge — checked in review, like
Built for Shopify. Concretely, a reviewer checks:

1. The app's embedded pages render in the Queek theme (shadcn + Queek
   theme tokens; no hand-restyled tokens — see the `queek-bridge` skill's
   `theme-mode.md`).
2. The app drives dashboard chrome through the bridge (title bar actions,
   toast, save bar, sidebar nav via `extensions.nav`, product picker,
   open/navigate, resumable paths, theme/locale, signed first load — the
   `queek-bridge` skill's `bridge-spec.md`), not through its own chrome or
   frame-top navigation.
3. Docs the reviewer expects the app to have followed: how to install the
   theme + blocks + bridge (U5 docs page).
