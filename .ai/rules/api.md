---
paths:
  - 'app/Http/Controllers/Api/**'
---

# Api

## Use Spatie query filtering and includes
API index and show endpoints must use Spatie Laravel Query Builder. Declare allowed filters, sorts, and includes explicitly; never pass arbitrary query parameters through.

## Expose include query params as snake_case
Public `include=` query parameter names must be snake_case (e.g. `cards.remember_card`), even when the underlying Eloquent relationship method is camelCase (e.g. `rememberCard`). Alias with `AllowedInclude::relationship('cards.remember_card', 'cards.rememberCard')` inside `allowedIncludes()` rather than passing the camelCase relation name directly. This keeps the API's public surface (query params, JSON keys) consistently snake_case while PHP relation methods stay idiomatic camelCase.
