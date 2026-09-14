# Frontend architecture

The frontend is an independent React and TypeScript SPA. Laravel serves the JSON API; the SPA is built and deployed from this directory and reaches Laravel through \`VITE_API_BASE_URL\`.

## Directory responsibilities

- \`src/app\`: application composition, URL navigation, and environment-backed configuration.
- \`src/pages\`: route-level screens. Pages compose features and present page-specific layout.
- \`src/features\`: business-capability code. Authentication, cards, decks, practice, and workspace orchestration belong here with their feature-specific state and UI.
- \`src/components\`: domain-neutral UI primitives only.
- \`src/services\`: infrastructure boundaries. \`apiClient.ts\` is the only module that knows Laravel URLs, cookies, CSRF headers, and response transport.
- \`src/types.ts\`: API contract types shared by multiple features.
- \`src/index.css\`: Tailwind CSS 4 theme tokens and global styles.

\`src/app/App.tsx\` is the composition root. It bootstraps the session and chooses between authentication and the authenticated workspace. There is intentionally no provider module because the application currently has no global context provider.

## Dependency boundaries

Pages may import features, shared components, services, and shared API types. Features may import shared components, services, application navigation, and shared API types. Shared components must not import pages or business features. Browser requests must go through \`src/services/apiClient.ts\`; add a descriptively named API operation there rather than calling \`fetch\` from a component.

Keep state in the narrowest owner that coordinates all of its consumers. The authenticated workspace currently owns deck/card collections because all three pages need coordinated refreshes. Move state into a feature hook only when that feature can own its complete loading and invalidation lifecycle.

## Commands

From \`frontend\`:

    npm run dev
    npm run format:check
    npm run typecheck
    npm run build

The build toolchain requires Node.js 20.19 or newer. There is currently no frontend test runner or lint command. Laravel API integration tests run from the repository root with:

    php artisan test --compact tests/Feature/SessionApiTest.php tests/Feature/DeckApiTest.php tests/Feature/CardApiTest.php tests/Feature/CardReviewApiTest.php
