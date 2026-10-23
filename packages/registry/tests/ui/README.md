# Registry browser tests

```sh
bun install --frozen-lockfile
bunx playwright install --with-deps chromium firefox webkit
bun run test:ui:types
bun run test:ui
```

The suite starts the real registry server with temporary local metadata, in-memory services, seeded packages, and fake binary storage. It exercises production routes and STX rendering without cloud credentials. Browser tests use `.browser.ts` so `bun test packages/registry` continues to run the backend suite separately.

Coverage includes:

- Responsive layouts from 320px to 2048px, including both navigation breakpoints.
- Cookie-backed login without JavaScript, and token creation, reload, and revocation.
- Publisher loading/saving failures, safe metadata rendering, and mobile layouts.
- Settings persistence, system themes, saved defaults, and restricted storage.
- Clipboard failures, keyboard disclosures, and navigation/history.
- Paginated build catalogs, accurate rebuild feedback, and live-resource cleanup.

CI runs Chromium, Firefox, and WebKit before deployment and retains screenshots and traces on failure.

Run one browser with `bun run test:ui --project=chromium`. Inspect a failure with `bunx playwright show-trace test-results/<test>/trace.zip`.
