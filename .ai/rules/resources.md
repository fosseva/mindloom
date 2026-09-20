---
paths:
  - 'app/Http/Resources/**'
---

# Resources

## Keep resource output and include references snake_case
JSON keys returned by API Resources must be snake_case, matching the include query params (see the api.md rule on aliasing includes). When a resource's `whenLoaded()` call needs a camelCase Eloquent relation name, that's fine internally, but never surface the camelCase name to API consumers via includes or response keys.
