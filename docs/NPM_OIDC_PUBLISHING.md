# Publishing to npm

`pantry publish --npm` publishes packages to npm. You don't need the npm CLI.
It publishes one package, or every package in a monorepo, and it can
authenticate with OIDC from CI, so no npm token has to live in your secrets.

Without `--npm`, `pantry publish` publishes to the Pantry registry instead.
`pantry npm:publish` runs the same npm pipeline; see [Other registries](#other-registries).

For a step-by-step setup of tokenless publishing, see
[Set up OIDC publishing for a monorepo](./NPM_OIDC_QUICKSTART.md).

## Quick start

```bash
# Log in to npm in the browser (once per machine)
pantry login

# Pack everything and show what would go up, without uploading
pantry publish --npm --dry-run

# Publish
pantry publish --npm --access public
```

## What gets published

### One package

Run in a package directory (one with `package.json` or `pantry.json` and no
`packages/` directory), and pantry publishes that package.

### Every package in a monorepo

Run at the root of a monorepo that has a `packages/` directory, and pantry
publishes every package under it:

```bash
cd my-monorepo
pantry publish --npm --access public
```

```text
Monorepo detected: 3 publishable package(s) in packages/
  1. my-lib
  2. @my-lib/react
  3. @my-lib/vue
```

How the run works:

- **Discovery.** A directory under `packages/` with a `package.json` is a
  package. A directory without one is searched further down. `node_modules`,
  `dist`, `build`, `test`, `tests`, `fixtures`, `__tests__`, and dot
  directories are not searched. Packages with `"private": true` are left out.
- **Order.** Packages publish in dependency order: a package goes up after the
  workspace packages it lists in `dependencies`, `devDependencies`, or
  `peerDependencies` (optional peers don't count). Ties are broken by name, so
  the order is the same on every machine.
- **Workspace ranges.** `workspace:` and `catalog:` ranges are rewritten in the
  published manifest. The `package.json` on disk is not changed.
- **Versions already on npm are skipped.** Before packing, pantry asks npm
  whether `name@version` exists and its advertised tarball can be downloaded
  and verified. Only then is the package skipped. Re-running
  a release publishes only what's missing. `--force-republish` turns the check
  off, but npm still refuses a version it already has.
- **Held back.** If a package fails to publish, every package that lists it in
  `dependencies`, `peerDependencies`, or `optionalDependencies` is held back
  for the rest of the run. Publishing them would put versions on npm that
  can't be installed, and npm versions can't be replaced. Fix the failure and
  run again; what already went up is skipped.
- **README and LICENSE.** If the repository root has `README.md`, `LICENSE`, or
  `LICENSE.md` and a package doesn't, pantry copies the root file into the
  package for the publish and removes the copy afterwards.
- **Native packages.** A package with a `build.zig` is a native Zig package and
  is skipped (it belongs on the Pantry registry). Set `"pantry": { "npm": true }`
  in its `package.json` to publish it to npm anyway, or `"pantry": { "npm": false }`
  to skip any package.

The run ends with a summary, and exits non-zero if any package failed or was
held back:

```text
Published 2/3 packages (1 failed)
```

A held-back package prints why:

```text
↷ held back: it installs @my-lib/core, which didn't publish. Fix that and run again; what's already on npm is skipped.
```

### Choosing packages

Pass package directories or globs to publish those instead of `packages/`.
They don't have to live under `packages/`. A glob may use `*` in its last path
segment only.

```bash
pantry publish --npm ./tools/cli './storage/framework/core/*'
```

Leave packages out by directory name with `--skip`:

```bash
pantry publish --npm --skip docs,playground
```

### Workspace and catalog ranges

Ranges are rewritten the way `bun publish` does it, in `dependencies`,
`devDependencies`, `peerDependencies`, and `optionalDependencies`:

| In `package.json` | Published as (sibling at `0.4.0`) |
| --- | --- |
| `workspace:*` or `workspace:` | `0.4.0` |
| `workspace:^` | `^0.4.0` |
| `workspace:~` | `~0.4.0` |
| `workspace:^1.0.0` | `^1.0.0` |
| `catalog:` | the version in the root `catalog` |
| `catalog:<name>` | the version in the root `catalogs.<name>` |

Versions come from the packages matched by the `workspaces` globs of the
nearest `package.json` that declares them. Catalogs are read from the root
`package.json`, at the top level or inside `workspaces`. A range that can't be
resolved stops that package with an error that names the dependency.

## Options

| Option | What it does |
| --- | --- |
| `--npm` | Publish to npm. Without it, `pantry publish` targets the Pantry registry. |
| `--access <public\|restricted>` | Package access. Default: `publishConfig.access`, else `restricted` for scoped names and `public` for unscoped ones. |
| `--tag <tag>` | Dist-tag. Default: `publishConfig.tag`, else `latest`. |
| `--dry-run` | Run scripts, pack, and print the summary. No authentication, no upload. |
| `--otp <code>` | One-time password for token publishing, sent as the `npm-otp` header. |
| `--no-oidc` | Skip OIDC and use a token. |
| `--no-provenance` | Publish with OIDC but without Sigstore provenance. |
| `--skip <dirs>` | Comma-separated directory names to leave out. |
| `--force-republish` | Don't skip versions that are already on the registry. |
| `--ignore-scripts` | Don't run `prepublish`, `prepare`, `prepublishOnly`, `prepack`, `postpack`, `publish`, or `postpublish`. Use it when CI builds in a separate step. |
| `--github-release` | After publishing, create a GitHub release for the current tag. Needs `GITHUB_TOKEN`. |
| `--files <paths>` | Comma-separated files to attach to that release. |
| `--registry <url>` | Select an npm-compatible registry with `--npm`. `--registry npm` selects npm directly. An explicit URL takes precedence over `publishConfig.registry`. |
| `[paths...]` | Package directories or globs to publish instead of `packages/`. |

`--access` accepts only `public` or `restricted`. An empty tag is rejected.
Both are checked before authentication.

The dry run still asks npm which versions exist, and still runs lifecycle
scripts unless you pass `--ignore-scripts`.

## Authentication

pantry tries these in order:

1. **OIDC**, when running in CI (skipped with `--no-oidc`). pantry gets an
   identity token from the CI provider for the audience
   `npm:registry.npmjs.org`, exchanges it with npm for a short-lived publish
   token for that one package, and publishes with Sigstore provenance. npm only
   makes the exchange for a package with a trusted publisher that matches the
   workflow. Set one up with [`pantry publisher:add`](./OIDC_AUTHENTICATION.md).
2. **`NPM_TOKEN`, `NODE_AUTH_TOKEN`, or `BUN_AUTH_TOKEN`** from the environment.
3. **Project `.npmrc`** in the current directory.
4. **User npmrc**: `$NPM_CONFIG_USERCONFIG` if set, else `~/.npmrc`. This is
   where [`pantry login`](#pantry-login) saves its token.
5. **`~/.pantry/credentials`**: an `NPM_TOKEN=` or `npm_token=` line.
6. **A prompt**, outside CI only. The token you paste is saved to
   `~/.pantry/credentials` and to the project's `.env`. Keep `.env` out of git.

npmrc files may use `//registry.npmjs.org/:_authToken=…` or `_authToken=…`,
with or without quotes, or `${ENV_VAR}` to read the token from the
environment. Tokens and one-time passwords are never printed.

Because environment tokens come first, a stale `NPM_TOKEN` in your shell wins
over a fresh login. Unset it to use the login.

### When an upload completes

The optional public existing-version precheck also has a 120-second deadline;
a stalled or incomplete response never counts as an existing version.

HTTP 200, 201, or 202 means the registry accepted the upload. Pantry reports
`Published` only after public `name@version` metadata matches and the downloaded
tarball has the SHA-512 integrity of the local upload. Public readback carries no
publishing credentials, including when the tarball is on a different host.

Metadata or tarball 404s may be temporary. Pantry waits up to 120 seconds,
including stalled response bodies. If the version is still unavailable, the
command exits non-zero with a pending result, holds dependent workspace
packages, and does not run `publish`/`postpublish` hooks or create the GitHub
release. A tarball or metadata mismatch fails immediately. Preserve the version
and investigate its registry state; do not bump or reupload merely because an
accepted version has not propagated yet.

Restricted packages receive the same metadata and integrity checks using the
publication credential at the configured registry origin. A redirect to a
different scheme, host, or effective port never receives that credential;
external tarball hosts must provide anonymously readable or signed download
URLs. Public packages must remain readable without a publishing credential.

Existing versions are skipped only after their advertised tarball is readable
and matches its integrity. Historical versions with only a SHA-1 `shasum` are
verified against that hash; newly uploaded bytes always require local SHA-512.

### When OIDC fails

- npm **rejected** the publish (403, 409, or 422): the package fails, with
  npm's message. No token is tried. A version conflict is a skip instead, unless
  you passed `--force-republish`.
- **Nothing was uploaded**: no CI provider was detected, or npm wouldn't
  exchange the token (usually: no trusted publisher for this package yet).
  pantry moves straight on to token authentication.
- **The upload was made but the answer was unclear** (a 401, 404, or 5xx after
  the upload, a dropped connection, or no answer within 120 seconds): npm
  commits a publish asynchronously, so pantry checks public metadata and the
  exact uploaded tarball for up to 120 seconds. A verified version counts as
  published. Otherwise the result remains pending and the command fails without
  sending the same version again through token authentication.
- Otherwise pantry falls back to token authentication. In CI with no token, the
  package fails with `No authentication method available in CI`.

Network failures before an upload starts and explicit rate-limit rejections
(429) are retried with exponential backoff, honoring npm's `Retry-After`.
Once bytes may have been sent, a dropped response, timeout, redirect, or 5xx
answer triggers exact tarball verification. A verified upload completes once;
an unresolved upload remains pending and is never sent again automatically.
Between packages pantry pauses briefly, and for at least 60 seconds after a
rate-limited failure. Upload and token-exchange requests never automatically
follow redirects with publishing credentials or one-time passwords.

### Scope not found

npm answers a publish to an organization that doesn't exist with
`404 Scope not found`. That isn't a token problem, and no token will fix it.
When a token publish gets this answer, pantry says so: the `@scope`
organization doesn't exist on npm, or the publishing account isn't a member. Create the organization at
<https://www.npmjs.com/org/create> and add the account that publishes.

## Configuration in `package.json`

```json
{
  "name": "@my-org/my-package",
  "version": "1.0.0",
  "publishConfig": {
    "access": "public",
    "tag": "latest",
    "registry": "https://registry.npmjs.org"
  }
}
```

Each package resolves its settings in this order:

1. An option on the command line, such as `--access public` or `--tag next`.
2. The matching `publishConfig` field in that package's manifest.
3. npm's defaults: `latest` for the tag, `restricted` for scoped packages,
   `public` for unscoped ones.

pantry sends the resolved access in the registry document and uses the resolved
tag as the `dist-tags` key.

## The tarball

pantry stages each package following its `files` field and npm's default
excludes, rewrites the manifest's workspace and catalog ranges, and packs the
result. The archive lists files only (no directory entries), sorted, with
extended attributes and macOS AppleDouble (`._*`) entries left out, so a
tarball packed on a Mac is accepted by npm. Before this, npm rejected Mac-packed
tarballs with `415 invalid path`.

The summary printed for each package shows the file count, shasum, integrity,
unpacked and packed size, tag, access, and registry.

## Lifecycle scripts

Unless `--ignore-scripts` is set, pantry runs these from the package's
`scripts`:

1. Before packing: `prepublish`, `prepare`, `prepublishOnly`, `prepack`.
2. After packing: `postpack`.
3. After a successful publish: `publish`, `postpublish`.

A failing pre-publish or `postpack` script stops that package.

In a monorepo release, build once before publishing and pass
`--ignore-scripts`, so no package builds itself again.

## GitHub Actions

A monorepo release, publishing with OIDC:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  npm:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write # lets pantry request an OIDC token

    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: pantry-pm/pantry/packages/action@main
        with:
          install: 'false'

      - run: bun install

      - run: bun run build

      # From the repo root: every package in packages/, in dependency order,
      # skipping versions already on npm.
      - run: pantry publish --npm --access public --ignore-scripts
```

`workflow_dispatch` lets you run the workflow by hand. Because published
versions are skipped, a manual run publishes whatever an earlier run left out.

The workflow file name must match the trusted publisher on npm
(`release.yml` here). To publish with a token instead, drop `id-token: write`
and pass the token:

```yaml
      - run: pantry publish --npm --access public --ignore-scripts
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## GitLab CI

pantry reads GitLab's identity token from `CI_JOB_JWT_V2`. Declare it with
npm's audience:

```yaml
publish:
  stage: deploy
  id_tokens:
    CI_JOB_JWT_V2:
      aud: npm:registry.npmjs.org
  script:
    - pantry publish --npm --access public
  rules:
    - if: $CI_COMMIT_TAG
```

## Other registries

Both npm commands accept an explicit registry URL, which takes precedence over
`publishConfig.registry`. Without either, they use `https://registry.npmjs.org`.
Use token authentication for another npm-compatible registry:

```bash
pantry publish --npm --no-oidc --registry https://npm.pkg.github.com
# Equivalent dedicated command:
pantry npm:publish --no-oidc --registry https://npm.pkg.github.com
```

`pantry npm:publish` takes the same options as `pantry publish --npm`, except
`--npm` and package paths. It still publishes a whole monorepo when run at the
root.

## `pantry login`

```bash
pantry login
```

Logs you in to npm in the browser, like `npm login`, without npm installed:

1. pantry opens npm's login page and prints its URL.
2. You sign in, including two-factor. pantry waits up to ten minutes.
3. pantry saves the token to `~/.npmrc`, or to `$NPM_CONFIG_USERCONFIG` when
   that is set, as `//registry.npmjs.org/:_authToken=…`. An existing line for
   that registry is replaced; every other line is kept. The file is written
   with mode `0600`.
4. pantry prints the account you're logged in as.

```text
Log in to npm in your browser:
  <the login URL npm returned>
Waiting for you to finish...

✓ Logged in as alice. The token is in /Users/alice/.npmrc.
```

| Option | What it does |
| --- | --- |
| `--registry <url>` | Log in to this registry. Default: `https://registry.npmjs.org`. |

Why it matters: npm refuses tokens that bypass two-factor for account changes
such as trusted publishing. `pantry publisher:add` needs the session that
`pantry login` creates; an automation or granular token won't do.

If `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or `BUN_AUTH_TOKEN` is set in your shell,
pantry uses it before the npmrc, and `pantry login` reminds you. Unset it to
use the login. A token in a project `.npmrc` also wins over `~/.npmrc`.

## Troubleshooting

### `OIDC publish failed (401): OIDC authentication failed`

npm wouldn't exchange the CI token for this package. Check that:

- the package has a trusted publisher: `pantry publisher:list --package <name>`;
- the repository and workflow file name match the workflow that ran;
- the workflow has `permissions: id-token: write`;
- if the trusted publisher names an environment, the job runs in it.

### `No OIDC provider detected`

pantry isn't running in CI. Locally, `pantry login` and publish with your login
session, or pass `--no-oidc` to go straight to a token.

### The first release of a new package

npm can't attach a trusted publisher to a package that doesn't exist yet. In a
CI run without a token, a new package fails and its dependents are held back.
Publish it once from your machine (`pantry login`, then `pantry publish --npm`),
add the trusted publisher, and the next CI run publishes the rest.

### `Version 1.2.3 already exists on npm`

You passed `--force-republish` for a version that's already on npm. Without
it, pantry skips that version. To publish new code, bump the version: npm
versions can't be overwritten.

### Two-factor on publish

If your account requires two-factor for publishing with a token, pass the code:

```bash
pantry publish --npm --otp 123456
```

## Related

- [Set up OIDC publishing for a monorepo](./NPM_OIDC_QUICKSTART.md)
- [Trusted publishing: `publisher:add`, `publisher:list`, `publisher:remove`](./OIDC_AUTHENTICATION.md)
- [Moving from npm tokens to OIDC](./OIDC_MIGRATION_GUIDE.md)
- [npm: trusted publishers](https://docs.npmjs.com/trusted-publishers)
