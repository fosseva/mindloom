---
paths:
  - 'app/Actions/**'
---

# Actions

## Use invokable application actions
Application action classes expose their workflow through __invoke rather than execute so the same action can be reused by HTTP, CLI, and future MCP entry points.
