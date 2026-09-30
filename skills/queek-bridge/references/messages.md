# Bridge message types (the contract)

Source: `@usequeek/app-sdk` `src/frame.ts:60-133`. (Repo:
`app-sdk-wt-bridge`.) Import these types; never re-declare the strings.

## App → dashboard (`AppOutboundMessage`, `frame.ts:88-111`)

| `type` | fields |
|---|---|
| `ready` | `capabilities?: string[]`, `sdkVersion?: string` |
| `resize` | `height: number` |
| `ack` | — |
| `title` | `heading: string`, `primaryAction?: TitleActionDef`, `secondaryActions?: TitleActionDef[]` |
| `toast` | `message: string`, `tone?: ToastTone`, `durationMs?: number` |
| `save-bar` | `state: SaveBarState` |
| `navigated` | `path: string` — the app reports every in-app move |
| `open` | `target: string` — dashboard path or allowlisted https URL |
| `pick-resource` | `resourceType: "product"`, `multiple?: boolean`, `filter?: string`, `selectionIds?: string[]` (preselect only), `requestId?: string` |

Every message carries `source` = the app source constant (`APP_SOURCE`).

## Dashboard → app (`AppInboundMessage`, `frame.ts:113-133`)

| `type` | fields |
|---|---|
| `token` | `token: string` — session refresh |
| `resize-ack` | — |
| `theme` | `mode: ThemeMode`, `locale?: string`, `capabilities?: string[]`, `bridge?: string` (dashboard bridge version `"1"`) |
| `title-action` | `id: string` |
| `save-bar-action` | `action: SaveBarAction` |
| `navigate` | `path: string` — dashboard drives; the app must not navigate the frame itself |
| `resource-picked` | `items: ResourceItem[]`, `requestId?: string` |
| `resource-pick-cancelled` | `requestId?: string` |

`ResourceItem` is `{ p_id: string, title: string, image?: string }`
(`frame.ts:60-64`). `PickResourceRequest` (`frame.ts:66-72`) is the same
shape as the `pick-resource` message: `resourceType: "product"` only.

## Versioning

`BridgeTheme.capabilities` (`frame.ts:74-86`): the dashboard declares its
capabilities (e.g. `["pick-resource"]`) on the handshake `theme` message.
Absent on legacy dashboards — the app must then assume the v0 set
(ready/token/resize only). `bridge` is the dashboard's bridge version
(`"1"`); absent on legacy dashboards.
