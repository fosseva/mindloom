---
paths:
  - '**'
---

# General

## Use type_id for a card's type reference
When a card references card_types, name the foreign key type_id, not card_type_id. Keep type_id consistent across the database schema, Laravel models, validation, API contracts, and frontend types.
