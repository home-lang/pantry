# Pantry package manager contract

This document describes the package-manager behavior implemented by the native
Zig CLI in `packages/zig`. It is a contract and operations reference, not a list
of intended features. `bun run docs:contracts:check` links every critical claim
below to its command registration or implementation source and fails CI when the
documentation drifts.

## Scope and source of truth

Pantry manages three related dependency classes:

| Class | Resolution source | Installation shape | Primary implementation |
| --- | --- | --- | --- |
| System tools and runtimes | Pantry's generated recipe catalog and binary metadata at `registry.pantry.dev` | Versioned native archives, binaries, shims, and environment links | `packages/zig/src/packages`, `packages/zig/src/install` |
| JavaScript packages | npm-compatible metadata, with the resolved URL and integrity claim retained in `pantry.lock` | Extracted package tree under the configured modules directory | `packages/zig/src/install/installer.zig`, `packages/zig/src/install/pipeline.zig` |
| Workspace and local packages | Workspace manifests, `workspace:` ranges, and Pantry's local-link registry | Linked or copied workspace package with resolved external dependencies | `packages/zig/src/cli/commands/install/workspace.zig`, `packages/zig/src/cli/commands/link.zig` |

The generated system catalog is local to the CLI, so normal search and package
classification do not require an online third-party catalog. Live Pantry-registry
search supplements the generated catalog for newly published packages. npm is a
separate compatibility and JavaScript dependency source; it is not Pantry's
system-package registry.

## Manifest discovery and precedence

Pantry recognizes project manifests including `pantry.json`, `package.json`, and
the YAML dependency files documented in the quick start. A workspace root owns a
single `pantry.lock`; workspace package constraints are recorded separately from
their resolved package entries. Explicit CLI package arguments narrow or extend
the manifest operation depending on the command.

Configuration precedence is:

1. explicit command options;
2. project configuration (`pantry.toml` and supported dependency manifests);
3. environment settings;
4. compiled defaults.

`--no-save` prevents both manifest and lockfile writes. `--force` intentionally
bypasses the normal lockfile/cache fast paths and resolves again. These options
are not equivalent: forcing a refresh does not imply that state must be saved.

## Install and resolution commands

| Command | Contract |
| --- | --- |
| `pantry install [packages...]` | Resolve and install manifest dependencies or explicit package specs. Alias: `pantry i`. |
| `pantry ci` | Perform a strict install with frozen-lockfile behavior; missing or divergent lock state is an error. |
| `pantry add <packages...>` | Add constraints to the selected dependency section, install them, and update lock state unless saving is disabled. |
| `pantry remove <packages...>` | Remove dependency declarations and corresponding project content. Supports preview and global selection. |
| `pantry uninstall <packages...>` | Remove installed package content from Pantry-managed locations. |
| `pantry update [packages...]` | Re-resolve selected or all dependencies subject to constraints; `--latest` may ignore the current constraint. |
| `pantry outdated [patterns...]` | Compare installed/declared versions with the appropriate Pantry or npm registry source. |
| `pantry list` / `pantry ls` | List installed packages with table, simple, or JSON output where registered. |
| `pantry why <package>` | Explain the dependency path that caused a package to be installed. |
| `pantry tree` | Display the dependency graph with depth, production, peer, and version controls. |
| `pantry dedupe` | Reduce duplicate compatible resolutions while preserving dependency constraints. |
| `pantry link` / `pantry unlink` | Register or consume a local package without publishing it. |
| `pantry search <query>` | Search the generated Pantry catalog, then supplement it from the live Pantry registry. |
| `pantry info <package>` | Show catalog metadata, or query the live Pantry registry for a user-published package. |
| `pantry audit` | Query vulnerability data for JavaScript dependencies with severity, production, and ignore controls. |

### Install option semantics

| Option | Effect and failure behavior |
| --- | --- |
| `--global` | Install into the system/global prefix rather than a project environment. |
| `--user` | Install globally for the current user under Pantry's user data directory. |
| `--force` | Fetch current metadata and reinstall; ignore the normal cache and lockfile preference. |
| `--production` | Install production dependencies and omit development dependencies. |
| `--dev` | Install only development dependencies. |
| `--peer` | Include peer dependencies when they are not enabled by project configuration. |
| `--ignore-scripts` | Do not execute package lifecycle scripts. This reduces behavior, not integrity verification. |
| `--offline` | Make no registry request; a missing resolution or tarball in local state is an error. |
| `--filter <pattern>` | Restrict a workspace operation to matching packages. |
| `--linker <isolated\|hoisted>` | Override the configured dependency layout and pass the same mode to delegated Bun installs. |
| `--frozen-lockfile` | Reject a missing lockfile or any install result that would change it. |
| `--no-cache` | Ignore the manifest cache; this is distinct from `--force` and deleting the content cache. |
| `--dry-run` | Compute and report the plan without installing or persisting it. |
| `--no-save` | Do not change the dependency manifest or `pantry.lock`. |
| `--quiet` | Suppress progress output, but never suppress the reason for a failed install. |
| `--verbose` | Emit resolution, cache, download, environment, and install diagnostics. |

## Resolution and install pipeline

Binary metadata lookups distinguish confirmed absence from failure. HTTP 404 or
valid metadata without the requested version/platform may continue normal
absence resolution; authentication failures, server errors, malformed metadata
and interrupted requests propagate as failures. Native metadata reads share one
30-second deadline across redirects and body reads. Native archive downloads
share one five-minute deadline and join cancelled I/O before returning.

`PANTRY_REGISTRY_URL` applies through the shared native HTTP transport. Each
redirect resolves its effective endpoint and recomputes credentials for that
origin; a registry token does not follow a download onto a foreign object-storage
origin. The Action's TypeScript installer likewise propagates registry errors
and scopes GitHub API tokens to `https://api.github.com` on every redirect.

The normal project operation follows this order:

1. Discover the effective project/workspace root and dependency manifest.
2. Read `pantry.lock` and determine whether recorded constraints still match.
3. Use the lockfile fast path only when every package is resolvable, destination
   content exists, and every concrete catalog-declared program is a regular,
   non-empty executable; otherwise repair or resolve the package.
4. Classify each spec as a Pantry system package, npm package, workspace package,
   local link, Git source, or another supported source.
5. Resolve exact versions and tarball URLs, retaining integrity metadata when the
   upstream registry supplies it.
6. Download in parallel unless offline or satisfied by cache.
7. Verify any supplied integrity claim before extraction.
8. Extract into managed content, validate declared programs, create executable
   shims/links, and run permitted lifecycle hooks.
9. Update the lockfile only after successful results and only when writes are
   allowed.

Partial failures return a non-zero command result. Quiet mode may remove progress
noise but cannot convert a failure into success or hide its final reason.
This includes a delegated Bun, pnpm, Yarn, or npm install: an unavailable
package-manager executable, spawn failure, signal termination, or non-zero exit
keeps `pantry install` non-zero and does not write the JS-install marker.

Safe native GETs share at most two retries across connection failures, HTTP 429,
and gateway errors (502, 503, and 504). `Retry-After` delta seconds and IMF-fixdate
HTTP dates set a minimum wait. An excessive delay is never shortened into an
early retry. The existing 30-second metadata and five-minute archive deadlines
include retry waits, redirects, and response bodies. Cancellation closes the
request before returning; partial archives and publication writes are not
replayed. Status diagnostics identify the responding origin without including
signed query strings or credentials. A quota that outlasts the deadline remains
a failed installation.

### Version-constraint semantics

Exact versions remain exact. Caret ranges keep the first non-zero component
stable (`^1.2.3` stays below 2.0.0, `^0.15.1` stays below 0.16.0, and
`^0.0.3` stays on 0.0.3). Tilde ranges keep the minor component when one is
present. `>=`, `<=`, `>`, `<`, and `=` compare the complete ordered version.
If no available version satisfies a declared range, installation fails instead
of substituting `latest`.

Prerelease intent is explicit. A stable range does not select development
builds. A range containing prerelease metadata, such as
`ziglang.org: ^0.17.0-dev`, may select the newest matching development build.
Pantry retains the complete prerelease/build identifier, consults live Pantry
binary metadata for Zig, orders its numbered development builds numerically,
and records the selected concrete version in `pantry.lock`. Registry-safe
underscores and upstream `+` build separators are treated as equivalent version
metadata for ordering, but the exact registry key is preserved for download.

## Lockfile contract

`pantry.lock` is the reproducibility boundary. It records exact package versions,
resolved locations, integrity when available, dependency relationships, and
workspace constraint state. It supports lockfile-first restore, which avoids
redundant registry resolution, and frozen validation, which compares the computed
result to committed state and rejects a missing or changed lockfile.

The lockfile does not create integrity evidence when an upstream package supplies
none. Such an entry is reproducible by version and URL but has weaker content
authentication and must not be described as cryptographically verified.

## Integrity, cache, and extraction

For npm-style tarballs, Pantry verifies a supplied raw SHA-256 digest or SRI
`sha256`, `sha512`, or legacy `sha1` value. A mismatch, malformed base64 value,
missing algorithm separator, or unsupported algorithm fails closed. When no
integrity claim exists, the installer can still validate archive structure and
uses the content cache's SHA-256 bookkeeping, but that is not equivalent to an
upstream-authenticated digest.

Downloaded content is cached by package, version, source, and checksum. A
poisoned cache entry that fails verification or extraction is evicted and may be
fetched again when networking is allowed. `--offline` never silently crosses the
network; if verified content is unavailable locally, the install fails.

Native archives are validated for expected archive structure. When a valid
sidecar checksum is available, it is checked before extraction. Absence of a
sidecar is explicitly weaker than a verified sidecar and is not a signature.

Project materialization is transactional at the package-directory boundary.
Pantry copies a verified global package into a sibling `.partial` directory,
checks its package structure and every concrete catalog-declared program, then
replaces the project copy. A zero-byte, non-regular, missing, or non-executable
program never satisfies the lockfile fast path. When the global package is
usable, rerunning `pantry install` repairs the project copy from it without a
network request. A failed or canceled copy leaves `.partial` state that cannot
count as installed and is removed on the next attempt.

## Lifecycle scripts and trust

Lifecycle scripts execute dependency code and are therefore a separate trust
decision from checksum validation. Pantry supports `pantry trust`,
`pantry untrusted`, and `pantry default-trusted` for managing that decision.
`--ignore-scripts` is the deterministic opt-out for CI or security-sensitive
installs. An integrity match proves bytes match the declared digest; it does not
prove that running those bytes is safe.

## Workspaces and local development

Workspace installs use the workspace root for `pantry.lock`, resolve `workspace:`
ranges before publication, deduplicate shared external packages where compatible,
and retain per-workspace declared constraints. `--filter` limits the selected
workspace set. Local links are recorded in Pantry's link registry and avoid a
publish round trip; they are mutable development inputs and do not carry normal
immutable-registry guarantees.

## Publication channels

| Command | Destination and contract |
| --- | --- |
| `pantry publish` | Publish archives to the Pantry registry. The default is `https://registry.pantry.dev`; a bearer token is required. |
| `pantry publish --npm` | Publish to npm (`https://registry.npmjs.org`, or `publishConfig.registry`), with OIDC or token authentication. At a monorepo root, publishes every non-private package under `packages/`; path and glob arguments select packages instead. |
| `pantry npm:publish` | Publish npm-compatible packages to npm or an explicitly selected compatible registry, with token or OIDC authentication. |
| `pantry publish:check` | Validate names and registry collisions without publishing; offline mode performs syntactic checks only. |
| `pantry publish:commit` | Publish temporary, commit-addressed monorepo packages and return installable URLs. Existing names can be skipped unless forced. |
| `pantry publish:binary` | Publish a platform-specific native binary and metadata to Pantry object storage. |
| `pantry login` | Log in to npm in the browser and save the session token to the user npmrc. |
| `pantry publisher:add`, `publisher:list`, `publisher:remove` | Manage npm trusted publishers through npm's trust API (`/-/package/<name>/trust`), the one `npm trust` uses. |
| `pantry sign` / `pantry verify` | Create or verify package signatures with configured Ed25519 key material. |

Pantry-registry publication and npm publication are intentionally different
surfaces. The command and selected registry determine the protocol; Pantry does
not transparently republish every npm dependency.

## npm publication semantics

`pantry npm:publish` and `pantry publish --npm` enter the same npm publication
pipeline. The package is staged according to npm's `files` and lifecycle rules,
workspace and catalog ranges are rewritten to registry-installable versions, and
the tarball summary is computed before authentication. `--dry-run` stops after
that preparation boundary: it does not request OIDC credentials, read a token,
or upload bytes.

At a monorepo root, the npm pipeline publishes every non-private package under
`packages/` in dependency order (`dependencies`, `devDependencies`, and
required `peerDependencies`, ties broken by name). Public packages receive an
anonymous existing-version precheck before packing; the advertised tarball must
be readable and verified before skipping. Restricted packages authenticate
through the publication path and verify an immutable-version conflict before
skipping. `--force-republish` disables skipping. A package whose `dependencies`,
`peerDependencies`, or `optionalDependencies` include a sibling that did not
publish in the same run is held back rather than published uninstallable, and
the run exits non-zero. Root `README.md`, `LICENSE`, and `LICENSE.md` are
copied into packages that lack them for the duration of the publish. Packages
with a `build.zig` are skipped unless `package.json` sets `"pantry": { "npm": true }`.

Tarballs list regular files only, sorted, without extended attributes or
AppleDouble (`._*`) entries, so archives packed on macOS are accepted by npm.

The effective dist-tag and access level use explicit precedence:

1. `--tag` and `--access` command options;
2. `publishConfig.tag` and `publishConfig.access` in `package.json`;
3. npm defaults: `latest` for the tag, `restricted` for scoped packages, and
   `public` for unscoped packages.

An empty tag or access other than `public` or `restricted` fails before
authentication. Pantry serializes the resolved tag into `dist-tags` and the
resolved access into the npm registry payload; printing those values without
including them in the upload is not considered a successful implementation.

OIDC trusted publishing is attempted first by default. On success, provenance is
attached unless `--no-provenance` is set. `--no-oidc` skips the exchange and uses
token authentication directly. A missing trusted-publisher relationship may
fall back to a token, while immutable-version conflicts and registry validation
errors (403, 409, 422) fail without retrying through another identity. When an
OIDC attempt fails after the upload was sent, or times out, Pantry polls the
public metadata and the exact uploaded tarball for up to 120 seconds. An
unconfirmed upload remains pending and fails without a second upload through a
different identity. When nothing was uploaded (no CI provider, or npm refused
the token exchange), it goes straight to token authentication. A token
publish rejected with npm's `Scope not found` is reported as a missing
organization or membership, with a pointer to `https://www.npmjs.com/org/create`. `--otp <code>` adds npm's
`npm-otp` header to token publication; Pantry never writes or prints the code.

An accepted HTTP 200, 201, or 202 upload is not yet a completed publication.
Pantry verifies the public package name, version, and downloaded tarball against
the local SHA-512 before reporting success, running `publish`/`postpublish`, or
creating a GitHub release. Temporary metadata or tarball unavailability is
polled with a 120-second deadline covering response bodies as well as headers;
an unresolved version remains pending and holds dependent workspace packages.
An integrity or metadata mismatch fails immediately. Existing versions require
a readable tarball matching their advertised SHA-512, or SHA-1 for historical
metadata that only supplies `shasum`.

Both npm commands honor `--registry <url>` before `publishConfig.registry`;
`--registry npm` selects the default npm registry. Public verification never
forwards publishing credentials to the metadata or tarball host. Restricted
packages use authenticated readback at the exact configured registry origin;
redirects across scheme, host, or effective port strip the credential.

A token upload follows the same verify-or-pending rule after a lost response,
408, 5xx, or redirect. Only network failures before sending starts and explicit
429 rejections may repeat an upload attempt. Uploads and token exchanges do not
automatically follow redirects, so publishing credentials and OTP headers cannot
be forwarded to another origin. The existing-version precheck uses a bounded
120-second read and never skips a package after an incomplete body.

Token discovery is deterministic:

1. `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or `BUN_AUTH_TOKEN`;
2. project `.npmrc`;
3. `NPM_CONFIG_USERCONFIG`, when set, otherwise `~/.npmrc` (where `pantry login`
   writes `//registry.npmjs.org/:_authToken`, mode `0600`);
4. `NPM_TOKEN` or `npm_token` in `~/.pantry/credentials`;
5. an interactive prompt when the process is not running in CI; the entered
   token is saved to `~/.pantry/credentials` and the project `.env`.

npmrc parsing accepts `_authToken`, registry-scoped keys such as
`//registry.npmjs.org/:_authToken`, matching single or double quotes, and a
whole-value `${ENV_VAR}` reference. Project configuration takes priority over
user configuration. Missing referenced environment variables do not expose the
placeholder or silently select a lower-precedence credential. Tokens and OTPs
are excluded from diagnostics.

Trust commands need a login session from `pantry login`: npm refuses tokens
that bypass two-factor for trust changes. Two-factor is satisfied by browser
approval when npm offers it, an interactive code prompt otherwise, or `--otp`.

Package/version conflicts remain immutable. In the default skip-existing mode, a
conflict caused by a version that appeared between the pre-check and the upload
is reported as a skip, not a failure. Rate-limit and transient server
responses may be retried with bounded exponential backoff; authentication,
validation, and version-conflict responses are returned as failures. Lifecycle
scripts remain subject to the explicit script policy, and publication success is
reported only after the registry accepts the package.

## Environment and installation locations

Project installs live in Pantry-managed project environments. Global installs
select the system prefix when writable, while `--user` selects the user-owned
global data directory. Custom paths are explicit and should be treated as an
operator choice because ownership, PATH behavior, and cleanup boundaries change.

Shell integration performs environment lookup on directory changes. The
environment identity incorporates project location and dependency state so two
projects, or two dependency revisions of one project, do not accidentally share
an incompatible active toolchain. Leaving the project restores the previous
environment instead of copying packages into the global shell.

## Failure modes operators should preserve

- Unknown package, impossible version, invalid manifest, or malformed lockfile:
  fail with the package/config cause.
- Frozen lockfile missing or divergent: fail without modifying it.
- Offline cache miss: fail without a network fallback.
- Integrity mismatch or unsupported integrity algorithm: fail before extraction.
- Missing, empty, non-regular, or non-executable declared program: repair from a
  verified global package or fail installation; never report the package as current.
- Untrusted lifecycle script: require trust or an explicit script policy.
- Registry authentication failure: fail without uploading.
- Duplicate immutable version: registry returns conflict; do not overwrite it.
- Partial workspace failure: return non-zero and do not claim complete success.

## Test and evidence map

| Contract | Evidence |
| --- | --- |
| Integrity algorithms and tamper rejection | `packages/zig/src/install/pipeline.zig` unit tests |
| Native program validation and zero-byte repair gating | `packages/zig/src/install/validator.zig` and installer tests |
| Frozen, missing, and stale lockfile behavior | install/workspace/lockfile tests under `packages/zig` |
| Registry resolution and install integration | `packages/zig/test/registry_integration_test.zig` and install tests |
| Workspace lock and publication behavior | workspace and catalog tests under `packages/zig/test` |
| Ed25519 signing and wrong-content rejection | `packages/zig/src/auth/signing_test.zig` |
| Documentation/source freshness | `scripts/docs-contracts.test.ts` and `bun run docs:contracts:check` |

Run the focused checks with:

```bash
bun run docs:contracts:check
bun test scripts/docs-contracts.test.ts
cd packages/zig && zig build test
```
