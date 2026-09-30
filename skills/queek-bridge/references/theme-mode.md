# Theme mode follows the dashboard

Source: `queek_backend/.agent/TASKS/active/app-ui-kit.md`, item U7
("Theme mode follows the dashboard").

- Dark when the dashboard is dark, light when light, switching live.
- First load: the dashboard adds `theme=light|dark` to the frame URL
  (dashboard `resolvedTheme`) so the app server-renders
  `<html class="dark">` with no flash.
- Live change: bridge `theme{mode}` → the SDK toggles the `dark` class
  (shadcn's own dark-mode mechanism).
- UI rule (from the same doc's U3/U5 direction): app UI is shadcn with the
  Queek theme — never restyle design tokens by hand.
