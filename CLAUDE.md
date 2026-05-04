# Claude Code Guidelines

## Linting

- Use **pickier** for linting — never use eslint directly
- Run `bunx --bun pickier .` to lint, `bunx --bun pickier . --fix` to auto-fix
- When fixing unused variable warnings, prefer `// eslint-disable-next-line` comments over prefixing with `_`

## Frontend

- Use **stx** for templating — never write vanilla JS (`var`, `document._`, `window._`) in stx templates
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

- **`pantry publish --npm --access public`**— publishes JS/TS packages to**npm** (npmjs.org). Used by monorepo release workflows for public packages (skips `"private": true`). Requires `NPM_TOKEN` env var.
- **`pantry publish:commit './packages/*'`**— publishes packages to the**pantry registry** (registry.pantry.dev) under a commit SHA. Used in CI continuous-release for commit-based installs (like pkg-pr-new). Auth: AWS credentials (direct S3 upload) or `PANTRY_REGISTRY_TOKEN` (HTTP upload to registry API).

## Registry Token Management

The pantry registry (`registry.pantry.dev`) runs on EC2 instance `i-012d45877ad44d64b` (`54.243.196.101`).

### Token architecture

`pantry publish:commit` supports two auth paths:

1. **AWS credentials** (preferred for pantry's own CI) — direct S3 upload, no registry involved
2. **Registry token** (for external repos like pickier) — HTTP upload to registry, validated by `PANTRY_REGISTRY_TOKEN` env var on the server

The registry validates tokens via simple string equality (`zig-routes.ts:validateToken`). The token value must match between the client (`PANTRY_REGISTRY_TOKEN` env var) and the server (systemd service environment).

### Where the token lives

| Location | Purpose |
|----------|---------|
| AWS SSM `/pantry/registry-token` (us-east-1, SecureString) | Source of truth |
| EC2 systemd service `/etc/systemd/system/pantry-registry.service` | Runtime config |
| GitHub secret `PANTRY_TOKEN` on `pickier/pickier` | CI publish |
| GitHub secret `PANTRY_TOKEN` on `home-lang/pantry` | CI publish |

### Rotating the token

```bash
./scripts/rotate-registry-token.sh
```

This script:

1. Generates a new `ptry_` token
2. Stores it in AWS SSM (`/pantry/registry-token`)
3. Updates the registry EC2 server's systemd config
4. Restarts the registry service
5. Updates `PANTRY_TOKEN` GitHub secret on all repos

To add more repos: `./scripts/rotate-registry-token.sh --repos "pickier/pickier,home-lang/pantry,other/repo"`

### Manual retrieval

```bash
# Read current token from SSM
aws ssm get-parameter --name "/pantry/registry-token" --with-decryption --region us-east-1 --query "Parameter.Value" --output text
```

### Site CSS validation (`@cwcss/crosswind`)

The site relies on `@stacksjs/stx`'s `injectCSS: true` to scan templates and inject crosswind utility CSS at render time. **`@cwcss/crosswind@0.2.0` and `0.2.1` ship a broken `package.json` exports map** — they declare `./dist/index.js` but the tarball ships JS at `./dist/src/index.js`, so `import('@cwcss/crosswind')` fails. stx swallows the error in a `try/catch`, the page renders with no utility CSS, and the layout collapses (header in a column, no `max-w` container, etc.).

The root `package.json` currently uses `@cwcss/crosswind@^0.2.4`, whose package exports have been verified to include `dist/index.js`. Before bumping it again, verify with `bun pm pack @cwcss/crosswind@<new>` that `dist/index.js` exists at the path declared in `exports`.

To validate locally before bumping:

```bash
cd packages/registry && bun -e "
import { renderTemplate } from '@stacksjs/stx';
import { resolve } from 'path';
const html = await renderTemplate(resolve('site/pages/about.stx'), {
  layout: resolve('site/pages/layout.stx'),
  options: { componentsDir: resolve('site/components') },
  injectCSS: true, wrapInDocument: false,
});
console.log('flex rule present:', /\.flex\s*\{/.test(html));
"
```

If `flex rule present: false`, crosswind isn't loading — investigate before deploying.

### Site deployment secrets

The `deploy-registry.yml` workflow SSHes from a GitHub runner into the registry EC2 box. It needs **two** repo secrets on `home-lang/pantry`:

| Secret | Source of truth | Value |
|--------|-----------------|-------|
| `REGISTRY_SSH_KEY` | `~/.ssh/stacks-production.pem` | private key for `ec2-user@` |
| `REGISTRY_HOST` | AWS SSM `/pantry/registry-host` (String) | `54.243.196.101` (instance `i-012d45877ad44d64b`) |

If `REGISTRY_HOST` is missing the deploy silently SSHes to `ec2-user@` (empty host) and fails with exit 1 — the site keeps running on whatever was last deployed and slowly rots. Restore with:

```bash
HOST=$(aws ssm get-parameter --name /pantry/registry-host --region us-east-1 --query Parameter.Value --output text)
echo -n "$HOST" | gh secret set REGISTRY_HOST --repo home-lang/pantry
gh workflow run deploy-registry.yml --repo home-lang/pantry --ref main
```

### Prerequisites

- AWS CLI configured (account `923076644019`, region `us-east-1`)
- SSH key `~/.ssh/stacks-production.pem` (user `ec2-user`)
- `gh` CLI authenticated with access to target repos

### Using in external repos

In a GitHub Actions workflow:

```yaml

- name: Setup Pantry

  uses: home-lang/pantry/packages/action@main

- name: Publish Commit

  run: pantry publish:commit './packages/my-pkg'
  env:
    PANTRY_REGISTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
```

The Pantry action exports `PANTRY_TOKEN` and `PANTRY_REGISTRY_TOKEN` as env vars for subsequent steps. The `publish:commit` command checks `PANTRY_REGISTRY_TOKEN` first, then `PANTRY_TOKEN`.

The pantry S3 registry (`registry.pantry.dev/binaries/`) hosts **system packages**(pre-built binaries like zig, curl, redis, bun) and**apps** (GUI applications like VS Code, Discord, Obsidian) uploaded via the `build.yml` / `sync-binaries.yml` workflows. JS/TS packages go to npm, not S3.

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
