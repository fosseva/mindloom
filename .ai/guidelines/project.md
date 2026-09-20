# Project conventions

## Omit shared relationship-name affixes from foreign keys

When the owning entity and the related entity share a name prefix or suffix, omit that shared affix from the foreign key and use only the related entity's distinguishing name followed by `_id`. For example, because `cards` and `card_types` share `card`, the foreign key on a card is `type_id`, not `card_type_id`. Apply this convention consistently to future relationships across the database schema, Laravel models, validation, API contracts, and frontend types. Keep the shared affix only when omitting it would make the foreign key ambiguous.
