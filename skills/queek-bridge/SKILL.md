---
name: queek-bridge
description: "Build embedded Queek app UI over the dashboard bridge: typed postMessage helpers, title bar, toast, save bar, navigation, open, resource picker, and dashboard-following theme mode. Use for any embedded app page, title bar action, picker, or theme wiring."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek bridge

The bridge is Queek's App Bridge equivalent: the dashboard embeds the app
in an iframe and the two sides talk postMessage. The SDK ships the typed
helpers — use them, do not hand-roll message strings.

Read the reference that fits before writing code:

- Exact message types (the contract) → `cat references/messages.md`
- Bridge behavior spec (handshake, capabilities, picker rules) → `cat references/bridge-spec.md`
- Theme mode follows the dashboard → `cat references/theme-mode.md`
