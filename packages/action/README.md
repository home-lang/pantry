<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# pantry Installer

A GitHub Action to install system dependencies using pantry.

## Usage

This action allows you to easily install dependencies with pantry in your GitHub Actions workflows.

```yaml

- name: Install Dependencies with pantry

  uses: pantry-pm/pantry/packages/action@main
# Automatically detects and installs project dependencies
# Optional parameters
# with
# packages: node python go # override auto-detection
# config-path: pantry.config.ts
```

## Inputs

| Name       | Description                           | Required | Default              |
|------------|---------------------------------------|----------|----------------------|
| packages   | Space-separated list of packages to install (overrides auto-detection) | No  | (empty) - auto-detects from project files |
| services   | Native CI services to install, start, health-check, and stop: `redis@X.Y.Z`, `postgres@17.11`, `mysql@26.7.0`, `typesense@30.2` | No | (empty) |
| config-path | Path to pantry config file        | No       | `pantry.config.ts` |
| package-dir | Directory to publish from for monorepo packages | No | (empty) - repository root |

## Features

- 🚀 **Cross-platform support**: Works on Linux, macOS, and Windows runners
- 🔍 **Smart dependency detection**: Automatically detects project dependencies from package.json, requirements.txt, go.mod, and more
- 🔄 **Config file support**: Can extract package list from your pantry config file
- 🌐 **Context-aware**: Provides full GitHub context to commands
- 🔧 **Bun-powered**: Uses Bun for faster installation
- 📦 **Global flag support**: Handles global installation flags in dependency files
- 💬 **Comment-aware**: Properly parses YAML files with inline comments

### Native dependency caches

The cache identity includes the Pantry version, platform, project manifests,
lockfile, and registry artifact digests for native packages and their runtime
dependencies. Rebuilding a package at the same version therefore invalidates
its previous cached installation. Restore keys retain the artifact identity;
they cannot restore an older binary after a registry rebuild.

When the registry cannot establish a verified dependency graph, the action
reports the reason and installs normally without restoring or saving a native
dependency cache. It does not treat an uncertain cache as a valid installation.
Pin the action to a release commit in production workflows.

### Health-checked Redis

Use the service input when tests need Redis. Pantry installs the exact requested
Redis package, binds it only to loopback, disables persistence for the ephemeral
runner, allocates a private port and random password, waits for authenticated
`PONG` and server identity, and stops only its owned process after the job.
`REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDISCLI_AUTH`
and `REDIS_SERVICE_VERSION` describe that instance.

Foreground startup records the process identity, then waits up to 30 seconds
for an authenticated `redis-cli ping`. A startup
failure includes the Redis logfile in the Actions error so port collisions,
binary linkage failures, and invalid configuration are directly diagnosable.

```yaml
- name: Setup Pantry and Redis
  uses: pantry-pm/pantry/packages/action@main
  with:
    install: 'false'
    services: redis@8.8.0

- run: bun test
```

The action fails before tests when the installed version differs from the exact
service pin or Redis does not become ready. `redis-url` and `redis-version` are
also available as action outputs. Pin both the action revision and the Pantry
binary `version` in release-sensitive workflows so source and CLI behavior are
independently reproducible.

### PostgreSQL, MySQL and Typesense

Pantry installs the complete native dependency graph, creates private service
data for each action invocation, allocates loopback ports and checks the running
versions. PostgreSQL readiness includes an authenticated SQL query. MySQL
readiness verifies the private data directory and an authenticated TLS session; Typesense
readiness includes an authenticated API request. The post action stops the
owned services and removes their private data, including after a failed job.

```yaml
- name: Set up the native test stack
  uses: pantry-pm/pantry/packages/action@main
  with:
    install: 'false'
    packages: bun.sh@1.4.2
    services: postgres@17.11 mysql@26.7.0 typesense@30.2
```

PostgreSQL exports `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`,
`POSTGRES_URL` and `POSTGRES_SERVICE_VERSION`. MySQL exports `MYSQL_HOST`,
`MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_SSL_CA`,
`MYSQL_URL` (with `ssl=true`) and `MYSQL_SERVICE_VERSION`. Its disposable user
can create and drop test databases; TCP connections require encryption. Native
Bun clients can use the URL directly or pass `{ tls: true }` explicitly;
both forms are checked against the live encrypted session. The URL flag also
supplies SSL configuration to framework drivers. Typesense exports
`TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY`,
`TYPESENSE_URL` and `TYPESENSE_SERVICE_VERSION`. Credentials are random per job
and masked in action logs. `postgres-url`, `postgres-version`, `typesense-url`
`mysql-url`, `mysql-version` and `typesense-version` are also action outputs. Keep these services on the
provided addresses; no fixed host ports or pre-existing databases are needed.

### Apple code signing

A macOS runner starts with no signing identities, so `codesign` and
`productbuild` have nothing to sign with. Set `apple-signing: 'true'` and the
Action imports your certificates into a temporary keychain before the build,
then deletes that keychain when the job ends — including when the job fails.

```yaml
- name: Set up signing
  id: signing
  uses: pantry-pm/pantry/packages/action@v0.11.0
  with:
    apple-signing: 'true'
    apple-signing-application-certificate: ${{ secrets.APPLE_APPLICATION_CERTIFICATE }}
    apple-signing-installer-certificate: ${{ secrets.APPLE_INSTALLER_CERTIFICATE }}
    apple-signing-certificate-password: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    apple-signing-provisioning-profile: ${{ secrets.APPLE_PROVISIONING_PROFILE }}

- name: Build and sign
  run: bun run build
  env:
    # Also available as steps.signing.outputs.apple-signing-identity
    SIGN_IDENTITY: ${{ env.APPLE_SIGNING_IDENTITY }}
    INSTALLER_IDENTITY: ${{ env.APPLE_INSTALLER_SIGNING_IDENTITY }}
    PROVISIONING_PROFILE: ${{ env.APPLE_PROVISIONING_PROFILE_PATH }}
```

Certificates are base64-encoded `.p12` files (`base64 -i cert.p12 | pbcopy`).
The identity names are discovered from the imported certificates and published
as outputs and `APPLE_*` environment variables, so the build step never has to
hardcode a certificate common name. Generate the certificates and profile with
`pantry app-store:csr` and `pantry app-store:provision --apply`.

### GitHub, Mac App Store, and S3 releases

Pantry can keep a GitHub release as the source of truth while delivering the
same signed package to App Store Connect and mirroring every artifact to AWS
S3, Backblaze B2, or Hetzner Object Storage. The Action first creates a GitHub
draft and verifies its artifacts. It then validates/uploads the App Store
package, mirrors the release, attaches provider receipts, and only then
publishes the GitHub release.

```yaml
- name: Publish release
  uses: pantry-pm/pantry/packages/action@v0.11.0
  with:
    install: 'false'
    release: 'true'
    release-files: |
      dist/Postline.pkg
      dist/Postline.dmg
    release-checksums: sha256
    release-app-store: 'true'
    release-app-store-bundle-id: com.example.postline
    release-app-store-version: ${{ github.ref_name }}
    release-app-store-build-number: ${{ github.run_number }}
    release-app-store-api-key-id: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
    release-app-store-issuer-id: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
    release-app-store-private-key: ${{ secrets.APP_STORE_CONNECT_PRIVATE_KEY }}
    release-s3: 'true'
    release-s3-provider: hetzner
    release-s3-bucket: app-releases
    release-s3-region: fsn1
    release-s3-public-url: https://downloads.example.com
    release-s3-access-key-id: ${{ secrets.RELEASE_S3_ACCESS_KEY_ID }}
    release-s3-secret-access-key: ${{ secrets.RELEASE_S3_SECRET_ACCESS_KEY }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The Mac App Store target requires a macOS runner and a package signed with a
Mac Installer Distribution certificate. The API key is written to an
owner-only temporary directory for `xcrun altool` and removed after delivery.
Create a dedicated App Store Connect API key with only the roles needed to
upload and manage this app; store its ID, issuer ID, and private key as
repository or organization secrets. For object storage, scope the access key
to the configured bucket/prefix and grant only object read/write/list access.
The object-storage target streams files from disk, retries stalled uploads,
verifies remote sizes, writes immutable versioned objects, and writes
`latest.json` with `no-cache`.

Every release includes `release-manifest.json` with SHA-256 hashes. Enabled
targets also attach `app-store-receipt.json` and/or
`s3-release-receipt.json`. To validate the release plan without creating a
GitHub release or making provider network changes, set `release-dry-run:
'true'`.

## Supported Dependency Files

The action automatically detects dependencies from these file types:

### Runtime Version Files

- `.nvmrc`, `.node-version` → Node.js
- `.ruby-version` → Ruby
- `.python-version` → Python
- `.terraform-version` → Terraform

### Package Manager Files

- `package.json` → Node.js (with engines, packageManager, volta support)
- `requirements.txt`, `pipfile`, `setup.py`, `pyproject.toml` → Python
- `Gemfile` → Ruby
- `Cargo.toml` → Rust
- `go.mod`, `go.sum` → Go
- `composer.json` → PHP
- `pom.xml`, `build.gradle` → Java

### Lock Files

- `yarn.lock`, `.yarnrc`, `.yarnrc.yml` → Yarn
- `bun.lock`, `bun.lockb` → Bun
- `pnpm-lock.yaml` → PNPM
- `uv.lock` → UV Python package manager

### Configuration Files

- `deno.json`, `deno.jsonc` → Deno
- `cdk.json` → AWS CDK
- `skaffold.yaml` → Kubernetes/Skaffold
- `justfile`, `Justfile` → Just task runner
- `Taskfile.yml` → Task runner
- `pixi.toml` → Pixi

### pantry/pkgx Dependency Files

- `dependencies.yaml`, `dependencies.yml`
- `deps.yaml`, `deps.yml`
- `pkgx.yaml`, `pkgx.yml`
- `pantry.yaml`, `pantry.yml`
- `.dependencies.yaml`, `.dependencies.yml`
- `.deps.yaml`, `.deps.yml`
- `.pkgx.yaml`, `.pkgx.yml`
- `.pantry.yaml`, `.pantry.yml`

### Global Flag Support

The action supports global installation flags in dependency files:

```yaml
# dependencies.yaml
global: true # Install all packages globally
dependencies:

  - node@22
  - python@3.12

# Override specific packages

  - typescript@5.0:

      version: 5.0.4
      global: false # Install locally

env:
  NODE_ENV: development
```

## Examples

### Basic Usage (Auto-detection)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Install Dependencies

        uses: pantry-pm/pantry-installer@v1
# Automatically detects Node.js from package.json
# and installs node + any other detected dependencies
```

### Using with Config File

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Install Dependencies from Config

        uses: pantry-pm/pantry-installer@v1
# Will automatically detect packages from pantry.config.ts
```

### Multi-platform Workflow

```yaml
name: Multi-platform CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:

      - uses: actions/checkout@v4

      - name: Install Dependencies

        uses: pantry-pm/pantry-installer@v1
# Auto-detects dependencies across all platforms
```

### Manual Package Override

```yaml
name: Manual Override

on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Install Specific Dependencies

        uses: pantry-pm/pantry-installer@v1
        with:
          packages: node python go rust
# Override auto-detection with specific packages

      - name: Run Tests

        run: npm test
```

### Commit Publishing (pkg-pr-new Replacement)

```yaml
name: Publish Commit Packages

on:
  pull_request:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Install Dependencies

        uses: pantry-pm/pantry-installer@v1

      - name: Publish Commit Packages

        run: pantry publish:commit './packages/_'
        env:
          PANTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
# Replaces: bunx pkg-pr-new publish './packages/_'
# Each package gets an install URL tied to the commit SHA
```

### Custom Config Path

```yaml
name: Custom Config

on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Install Dependencies from Custom Config

        uses: pantry-pm/pantry-installer@v1
        with:
          config-path: .github/pantry.config.ts

      - name: Run Tests

        run: npm test
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/pantry-pm/pantry-installer/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/pantry-pm/pantry/blob/main/.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/pantry-pm/pantry/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://stacksjs.com/discord)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/pantry-pm/pantry/blob/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/pantry-installer?style=flat-square
[npm-version-href]: https://npmjs.com/package/pantry-installer
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/pantry-pm/pantry-installer/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/pantry-pm/pantry-installer/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/pantry-pm/pantry-installer/main?style=flat-square
[codecov-href]: https://codecov.io/gh/pantry-pm/pantry-installer -->
