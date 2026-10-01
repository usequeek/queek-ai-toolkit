# Manifest shape

Sources: the validator contract — `@usequeek/cli`
`src/lib/app-manifest.ts` (repo: `usequeek/theme-tools`) and the Queek API
(docs.usequeek.com) `app/Services/Apps/AppManifestValidator.php`. Groups
map 1:1 onto the backend manifest keys ([listing], [access], [webhooks],
[app], [[settings]], [extensions]).

ILLUSTRATIVE, TRIMMED example (not a copy of any shipped toml): cut
from a real app manifest and extended by one line. The source carries five
`[[extensions.nav]]` tables — two are shown (`Bookings` → `/admin`,
`Services` → `/admin/services`); cut: `Calendar` → `/admin/calendar`,
`Hours` → `/admin/hours`, `Settings` → `/admin/settings`. The source
block schema carries two fields — one is shown (`date`); cut: `time`.
ADDED (illustrative, the source does not carry it): the
`optional_scopes` line, to show the `[access]` table shape. Shapes of
everything shown match the source.

```toml
slug = "booking"
name = "Service Booking"
distribution = "public"
icon = "calendar"
developer = "Queek"

[listing]
description = "Take bookings for services: availability, slot holds and paid-order confirmation."

[access]
scopes = [
  "merchant-business_profile-read",
  "merchant-orders-read",
  "merchant-orders-update",
  "merchant-items-read",
  "merchant-items-detail",
  "merchant-app-requirements-write",
]
# Declared-optional scopes (same table; granted on request, never at
# install — disjoint from `scopes`, see `manifest-rules.md`):
optional_scopes = ["merchant-items-delete"]

[webhooks]
topics = ["orders/paid"]
url = "https://booking.apps.queek.com.ng/webhooks"

[app]
install_url = "https://booking.apps.queek.com.ng/install"
uninstall_url = "https://booking.apps.queek.com.ng/uninstall"
settings_url = "https://booking.apps.queek.com.ng/settings"

[[settings]]
key = "default_hold_ttl_minutes"
label = "Default hold time (minutes)"
type = "number"
required = false
help = "How long a held slot waits for payment before it frees up."

[extensions]
merchant_page_url = "https://booking.apps.queek.com.ng/admin"

[extensions.proxy]
url = "https://booking.apps.queek.com.ng/proxy"
subpath = "availability"
share_customer_id = false

[[extensions.blocks]]
key = "service_booking"
type = "app_block"
title = "Book a service"
description = "Live availability for this service."
targets = ["product"]
# Render only on products that declared a bookable requirement:
available_if = "declared_products"
link_url = "https://booking.apps.queek.com.ng/book"

[[extensions.blocks.schema]]
key = "date"
label = "Date"
type = "date"
required = true

[[extensions.nav]]
label = "Bookings"
path = "/admin"

[[extensions.nav]]
label = "Services"
path = "/admin/services"

[dev]
command = "tsx watch src/index.ts"
port = 3000
```

Scope names are `merchant-<area>-<access>` (`merchant-orders-read`,
`merchant-orders-update`, …). Webhook topics are Merchant API topics
(`orders/paid`). Block `targets` name storefront surfaces (`product`).
