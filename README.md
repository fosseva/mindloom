# Mindloom

Mindloom is an API-first personal learning system for deliberate recall, articulation, application, and spaced review. Laravel owns the domain and business workflows; future web, mobile, CLI, and MCP clients should call the same application actions.

## Domain

- A `User` owns `Deck` records, and a deck contains `Card` records.
- `card_types` defines the supported card types; cards reference it through `type_id`.
- Each card type owns user-facing ratings whose `recall_quality` maps to the adaptive scheduler.
- Each card has one normalized subtype record in `remember_cards`, `explain_cards`, `apply_cards`, or `note_cards`.
- `learning_records` stores per-user scheduling state separately from shareable card content.
- `card_reviews` is append-only review history referencing the selected rating.
- Multi-record workflows live in `app/Actions`, independently of HTTP controllers.

## API

Version 1 routes live under `/api/v1` and use Laravel Sanctum's stateful cookie authentication for the first-party SPA. The frontend first requests `/sanctum/csrf-cookie`, then signs in through `POST /api/v1/login`. The authenticated user is available from `GET /api/v1/user`, and `DELETE /api/v1/logout` ends the session.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/v1/decks` | List or create decks |
| GET, PATCH, DELETE | `/api/v1/decks/{deck}` | Read, update, or soft-delete a deck |
| GET, POST | `/api/v1/decks/{deck}/cards` | List or create cards in a deck |
| GET, PATCH, DELETE | `/api/v1/cards/{card}` | Read, update/archive, or soft-delete a card |
| GET | `/api/v1/cards/due` | List the authenticated user's due cards |
| GET | `/api/v1/card-types` | List card types and their available ratings |
| POST | `/api/v1/cards/{card}/reviews` | Record a rating and schedule the next review |

Card creation uses a flat client payload. For example:

```json
{
  "type_id": 1,
  "question": "What is idempotency?",
  "answer": "Repeating the operation has the same intended effect.",
  "hint": null
}
```

Responses keep subtype fields under `content` and per-user scheduling state under `learning`, avoiding exposure of subtype table names.

Deck and card index/show endpoints use Spatie Laravel Query Builder with explicit allow lists. Supported query parameters include deck name and archived filters, card type and archived filters, sorting, and relationship includes. Deck sort order is stored per user in `user_deck_preferences`, keeping shared deck content independent from personal organization.

## Scheduling

`ScheduleNextReviewAction` uses FSRS-style stability, difficulty, and retrievability calculations. A rating's `recall_quality` selects the scheduling outcome, while each user's learning record stores the resulting interval and memory state. Forgotten cards return after a 20-minute short step. `RecordCardReviewAction` locks the learning record, records before/after values, and updates it in one transaction.

## Frontend

The independent React and TypeScript client lives in `/frontend`. It uses Vite, Tailwind CSS 4, Sanctum's CSRF cookie flow, and only communicates through the JSON API.

Frontend environment values live in `.env.development`; deployments should provide `VITE_API_BASE_URL` and `VITE_APP_HOST` based on `.env.example`. Local development uses `http://mindloom.test` for the API and `mindloom.test:5174` for Vite so Sanctum cookies remain same-site.
Node.js 24 is the project's minimum frontend runtime.

```bash
php artisan serve
cd frontend
npm install
npm run dev
```

## Development

```bash
composer run setup
php artisan test --compact
```

PostgreSQL is the default database. Development uses `mindloom` and the test suite uses a separate `mindloom_test` database rather than SQLite. Configure the local PostgreSQL credentials in `.env`; deployed environments must provide their own secrets.

`DatabaseSeeder` creates one small demo account with CTO Fundamentals, Vocabulary, and Leadership decks and representative cards.
