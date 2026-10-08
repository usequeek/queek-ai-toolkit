# Manifest shape

Sources: the validator contract — `@usequeek/cli`
`src/lib/app-manifest.ts` (repo: `usequeek/theme-tools`) and the Queek API's
manifest validator. Groups map 1:1 onto the manifest keys ([listing],
[access], [webhooks], [app], [[settings]], [extensions]).

ILLUSTRATIVE, TRIMMED example (not a copy of any shipped manifest): a
service-booking app with two nav items and one block field. Real manifests
can carry more of each. Shapes of everything shown match the validator.

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
url = "https://booking.example.com/webhooks"

[app]
install_url = "https://booking.example.com/install"
uninstall_url = "https://booking.example.com/uninstall"
settings_url = "https://booking.example.com/settings"

[[settings]]
key = "default_hold_ttl_minutes"
label = "Default hold time (minutes)"
type = "number"
required = false
help = "How long a held slot waits for payment before it frees up."

[extensions]
merchant_page_url = "https://booking.example.com/admin"

[extensions.proxy]
url = "https://booking.example.com/proxy"
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
link_url = "https://booking.example.com/book"

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
