# Registry browser tests

```sh
bun install --frozen-lockfile
bunx playwright install --with-deps chromium firefox webkit
bun run test:ui:types
bun run test:ui
```

The suite starts the real registry server with temporary local metadata, in-memory services, a seeded package, and fake binary storage. It exercises production routes and STX rendering without cloud credentials. Browser tests use `.browser.ts` so `bun test packages/registry` continues to run the backend suite separately.

Checks cover responsive layout from 320px through 2048px (including both sides of the navigation breakpoint), populated package and search pages, navigation/history, themes, keyboard access, native modal behavior, restricted browser storage, reduced motion, and search cancellation. CI runs all three browser engines before deployment and retains screenshots and traces on failure.

Run one browser with `bun run test:ui --project=chromium`. Inspect a failure with `bunx playwright show-trace test-results/<test>/trace.zip`.
