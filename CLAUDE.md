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
