# Theme mode follows the dashboard

Sources: `@usequeek/app-sdk` `src/theme.ts` (`THEME_PARAM`,
`themeBootstrapScript`, `applyTheme`, `installThemeListener`,
`rememberThemeMode`, `getThemeModeFromUrl`, `THEME_STORAGE_KEY`),
`src/browser.ts` (the `/browser` entry). (Repo: `usequeek/app-sdk`.)

- Dark when the dashboard is dark, light when light, switching live.
- First load: `theme` is a plain unsigned URL param (`theme=light|dark`,
  `THEME_PARAM`) — a first-paint hint only, never auth. Render it with
  the inline `<head>` snippet from `themeBootstrapScript()` so the first
  paint does not flash; the live bridge message overwrites it.
- Live change: bridge `theme{mode}` → `applyTheme(mode)` toggles the
  `dark` class (shadcn's own dark-mode mechanism); `installThemeListener`
  follows the messages. The mode is remembered in `sessionStorage`
  (`THEME_STORAGE_KEY`, via `rememberThemeMode` / `getThemeModeFromUrl`),
  so an in-frame reload without the param still paints correctly.
- UI rule: app UI is shadcn with the Queek theme — never restyle design
  tokens by hand.
