---
paths:
  - 'app/Http/Requests/**'
---

# Requests

## Accept only client-owned request fields
Validate and accept only values the client legitimately owns. Generate authoritative timestamps and derived or system-managed values on the server; do not expose them as request fields merely to make tests deterministic—freeze application time in tests instead.
