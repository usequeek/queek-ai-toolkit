---
name: queek-app
description: "Build a Queek app on the Merchant API: install/uninstall/settings handoff (verify first), Standard Webhooks and app-proxy verification with whsec_ secrets, and the typed Merchant API client over X-Client-Key with Idempotency-Key writes. Use for any Queek app install flow, webhook handler, or Merchant API call."
metadata:
  author: Queek
  version: "0.1.0"
---

# Queek app

Framework-agnostic, Web-standard handlers (`Request` in, `Response` out).
Read the reference file that fits the task before writing code:

- Install / uninstall / settings handoff → `cat references/install-handoff.md`
- Topic webhooks and app-proxy verification → `cat references/webhooks.md`
- Calling the Merchant API → `cat references/merchant-client.md`

Rules that apply everywhere in this skill:

1. Verify every signed delivery BEFORE acting on it (signature check first,
   then parse, then run business logic). Never proof-call the Merchant API
   before answering the delivery.
2. Secrets are `whsec_…` strings used whole — never base64-decode them,
   never log them.
3. Every rule below cites the SDK source file it came from. If the SDK
   disagrees with this skill, the SDK wins.
