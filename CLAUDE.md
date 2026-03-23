# Claude Code Guidelines

## Linting

- Use **pickier** for linting — never use eslint directly
- Run `bunx --bun pickier .` to lint, `bunx --bun pickier . --fix` to auto-fix
- When fixing unused variable warnings, prefer `// eslint-disable-next-line` comments over prefixing with `_`

## Frontend

- Use **stx** for templating — never write vanilla JS (`var`, `document.*`, `window.*`) in stx templates
- Use **crosswind** as the default CSS framework which enables standard Tailwind-like utility classes
- stx `<script>` tags should only contain stx-compatible code (signals, composables, directives)

## Dependencies

- **buddy-bot** handles dependency updates — not renovatebot
- **better-dx** provides shared dev tooling as peer dependencies — do not install its peers (e.g., `typescript`, `pickier`, `bun-plugin-dtsx`) separately if `better-dx` is already in `package.json`
- If `better-dx` is in `package.json`, ensure `bunfig.toml` includes `linker = "hoisted"`

## Commits

- Use conventional commit messages (e.g., `fix:`, `feat:`, `chore:`)

## Publishing

There are two distinct publish targets:

- **`pantry publish --npm --access public`** — publishes JS/TS packages to **npm** (npmjs.org). Used by monorepo release workflows for public packages (skips `"private": true`). Requires `NPM_TOKEN` env var.
- **`pantry publish:commit './packages/*'`** — publishes packages to the **pantry registry** (registry.pantry.dev) under a commit SHA. Used in CI continuous-release for commit-based installs (like pkg-pr-new). Requires AWS credentials for S3 upload.

The pantry S3 registry (`registry.pantry.dev/binaries/`) hosts **system packages** (pre-built binaries like zig, curl, redis, bun) and **apps** (GUI applications like VS Code, Discord, Obsidian) uploaded via the `build.yml` / `sync-binaries.yml` workflows. JS/TS packages go to npm, not S3.

## GitHub Action (`packages/action/`)

The Setup Pantry action (`home-lang/pantry/packages/action@main`):

- Default behavior: installs pantry CLI + runs `pantry install` (reads `pantry.jsonc`/`deps.yaml`)
- Built-in caching: caches `pantry/` dir keyed on `pantry.lock` hash
- Installs bun via pantry, creates `bunx` symlink, sets `BUN_INSTALL` env var
- Use `install: 'false'` to skip `pantry install` (just CLI in PATH)
- For local repo: `uses: ./packages/action`
- For external repos: `uses: home-lang/pantry/packages/action@main`

## Deps Files

- `pantry.jsonc` — system deps (zig, bun, zig-libs). Read by `pantry install`.
- `deps.yaml` — alternative format for system deps. Same purpose as `pantry.jsonc`.
- `package.json` — JS/TS deps. Read by `bun install`.
- Use domain names (`bun.sh`, `ziglang.org`) in deps files until aliases (`bun`, `zig`) are in a released pantry binary.
