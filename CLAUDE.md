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

- **`pantry publish --npm --access public`**— publishes JS/TS packages to**npm** (npmjs.org). Used by monorepo release workflows for public packages (skips `"private": true`). Authenticates with OIDC in CI (set up with `pantry login` + `pantry publisher:add`), else `NPM_TOKEN` / `NODE_AUTH_TOKEN` / `BUN_AUTH_TOKEN` or an npmrc token.
- **`pantry publish:commit './packages/*'`**— publishes packages to the**pantry registry** (registry.pantry.dev) under a commit SHA. Used in CI continuous-release for commit-based installs (like pkg-pr-new). Auth: AWS credentials (direct S3 upload) or `PANTRY_REGISTRY_TOKEN` (HTTP upload to registry API).

## Registry Operations

The registry token, the box it runs on, deploy secrets and the site stacks are
documented in the private [pantry-pm/ops](https://github.com/pantry-pm/ops)
repo. They describe our particular deployment rather than this tool, so they
don't belong in the open-source repo.

To publish from a new repo's CI, no infrastructure access is needed:

```bash
pantry token set          # store the registry token locally, from stdin
pantry token sync --repo owner/name
```

## Site CSS validation (`@cwcss/crosswind`)

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

## Using in external repos

In a GitHub Actions workflow:

```yaml

- name: Setup Pantry

  uses: pantry-pm/pantry/packages/action@main

- name: Publish Commit

  run: pantry publish:commit './packages/my-pkg'
  env:
    PANTRY_REGISTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
```

The Pantry action exports `PANTRY_TOKEN` and `PANTRY_REGISTRY_TOKEN` as env vars for subsequent steps. The `publish:commit` command checks `PANTRY_REGISTRY_TOKEN` first, then `PANTRY_TOKEN`.

The pantry S3 registry (`registry.pantry.dev/binaries/`) hosts **system packages**(pre-built binaries like zig, curl, redis, bun) and**apps** (GUI applications like VS Code, Discord, Obsidian) uploaded via the `build.yml` / `sync-binaries.yml` workflows. JS/TS packages go to npm, not S3.

## Prebuilt download vs custom source builds — do NOT convert custom builds

A recipe can either **compile from source** or **download an official prebuilt binary** (the latter is faster/more reliable and covers platforms we can't compile). The download pattern lives in the recipe itself: the `build.script` cases on `{{hw.platform}}`/`{{hw.arch}}`, `curl`s the official per-platform asset, and extracts it (see `src/recipes/ziglang.org.ts` — Zig is a download recipe, not a source build). Versions come from the recipe's `versionSource`. The recipe is the single source of truth for *how to download every version per platform*. (The legacy `scripts/sync-packages.ts` hand-codes the same logic for ~19 domains — that mechanism is redundant with recipe-driven downloads and should not be grown; prefer making a package a zig-style download recipe.)

**Prefer prebuilt download ONLY for simple, single-binary upstream tools with no custom value-add** (Go/Rust CLIs like gh, ripgrep, fd, jq, yq, k9s, helm, hashicorp tools — they ship official multi-platform release binaries).

**NEVER convert a deliberately customized source build to a prebuilt download.** Some packages are intentionally compiled with our own configuration and must keep their source build:

- **php.net** — built with a specific extension matrix (`--enable-fpm`/`--enable-gd`/`--enable-mbstring`/`--with-pgsql`/`--with-openssl`/`--with-sodium`/… ~30 flags) plus custom `php-config`/`phpize` patching and a load-verification step. A vanilla prebuilt PHP would drop all of it.
- **postgresql.org** and other databases/servers where we control build-time options/extensions.
- Anything whose recipe carries meaningful `--with-`/`--enable-` flags, patches, or bundled extensions — those flags ARE the reason we build from source.

When expanding prebuilt coverage, the test is: *does upstream ship the exact binary we'd otherwise produce, with nothing we customize?* If not, keep compiling.

## Cross-platform download fanout — produce ALL platforms from ANY box

A download recipe has **no compile step** — its "build" is just `curl the official per-platform asset + repackage`. So **any single box can produce the artifact for any target platform**: a linux-x86-64 box can `curl` the darwin-arm64 prebuilt and upload it under the `darwin-arm64` key just as easily as its own. This eliminates the need for macOS / ARM hardware to fill download-recipe coverage across platforms.

How it works:
- `build-package.ts` already derives `hw.platform`/`hw.arch` from the **`--platform <target>` arg**, not the host. Running `--platform darwin-arm64` on a Linux box curls the darwin-arm64 asset.
- The health-check can't *execute* a foreign binary (no running a Mach-O on Linux). So when target os/arch ≠ host, `build-package.ts` **skips the execution test** and instead runs `verifyForeignArtifact()` — a `file -bL` magic check asserting the installed binary is the right type/arch (`Mach-O`+`arm64`/`x86_64` or `ELF`+`aarch64`/`x86-64`). This catches arch-mapping bugs without running the binary. Same-platform builds still run the full execution test.
- `build-all-packages.ts --download-only` filters the sweep to **only** download recipes (no real `distributable.url` + a `build.script` that curls a per-platform asset). Source recipes are skipped — a source build with a foreign `--platform` would try to cross-compile and fail, so they must stay on their native channel.

Fleet wiring (`provision-build-workers.ts`): each box is assigned **one foreign platform** (partitioned by box index: `['darwin-arm64','linux-arm64'][i % 2]`) and runs a continuous download-only sweep for it via `pantry-xdl.service` (script `/root/xdl-daemon.sh`, platform in `/root/xdl-platform`). This is baked into `configureBox()` so re-provisioned boxes set it up automatically — alongside `pantry-fleet.service` (native linux-x86-64 source+download sweep) and `pantry-diskguard.service`. Check it in the fleet sweep: `systemctl is-active pantry-xdl.service`.

**Division of labor:** download recipes → filled on every platform by the x86-64 Linux fleet (cheap, no macOS/ARM needed). Source-only-with-no-prebuilt → GitHub Actions runners (the only place that can natively compile darwin / linux-arm64) — **monitor those runners actively** (they're expensive, esp. macOS 10×) so they don't break or go stale.

**macOS Intel (darwin-x86-64) is retired for builds.** No workflow, orchestrator platform list, or fleet assignment may produce new darwin-x86-64 artifacts — do not re-add it to any matrix. Already-published darwin-x86-64 binaries/apps stay on the registry and remain served (`packages/registry/src/server.ts` keeps the platform key for listing/downloads).

**Test darwin on the dev Mac, not on a GitHub runner.** The development machine
IS an Apple Silicon Mac, and `build-package.ts --platform darwin-arm64` runs
there directly — so a darwin build, a recipe change, a linker error or a patch
that may not apply should be reproduced locally FIRST. Dispatching a workflow to
find out costs 10x and takes an order of magnitude longer to answer. Worked
examples from the session that established this rule:

```bash
# Does the recipe build on darwin at all?
PANTRY_BUILD_REPORT=0 bun packages/ts-pantry/scripts/build-package.ts \
  --package redis.io --version 8.10.1 --platform darwin-arm64 \
  --build-dir /tmp/rb --prefix /tmp/ri

# Cross-produce a foreign artifact from the same Mac (download recipes only)
#   → verifyForeignArtifact checks the ELF/Mach-O magic instead of executing it
... --package meilisearch.com --version 1.53.1 --platform linux-x86-64 ...
```

A/B against the real upstream tarball is usually enough and takes minutes: that
is how redis's `module_tests`/`-Wl,-rpath` failure, its env-vs-command-line
PREFIX bug, and OpenSSL 4.0.2's patch applying cleanly were all settled without
allocating a single macOS runner. Reach for a Mac runner only to PUBLISH, never
to diagnose.

**But the dev Mac's toolchain is AHEAD of the runners', so a local failure is
not proof of a CI failure.** This machine is on Xcode 27 / Apple clang 21;
`publish-darwin-native` runs macos-14 with Xcode 16.2. perl 5.44.0 is the worked
example: it dies here with `panic: del_backref` while miniperl bootstraps, and
builds and publishes perfectly on the runner. So a local **success** is strong
evidence, and a local **failure** means "reproduce the toolchain or check the
runner" — never "the recipe is broken". The reverse gap matters too: something
that needs a newer SDK may pass here and fail there.

**No WASTEFUL unsupervised macOS — macOS runs only when a Mac is genuinely required.** macOS runners bill ~10×. The rule is: **no broad/scheduled macOS sweeps**, and any macOS job that runs automatically must be **tightly gated to only the specific packages that truly need a Mac**. The `schedule:` cron has been removed from every Mac-spawning sweep — `build.yml`, `build-versions.yml`, `build-residual.yml`, `sync-binaries.yml`, and `build-orchestrator.yml` (also disabled in the Actions tab); they keep `workflow_dispatch` for supervised runs. There are exactly **two** automatic macOS paths, and both are gated on a set the workflow computes first: `publish-changed-packages.yml`'s `publish-darwin-native` job (see below), which spins up a Mac ONLY when a changed package is a genuine darwin source recipe pkgx can't provide, and `check-desktop-updates.yml`'s `publish-macos` job, which spins one up ONLY when a disk-image app is actually behind. Both compute the needed set in a cheap ubuntu job and run `if` that set is non-empty, so darwin updates publish properly without a firehose. Do NOT add a broad `schedule:`/`push:` macOS matrix; if a new automatic Mac job is unavoidable, gate it the same way (compute the exact needed set, run `if` that set is non-empty). darwin-arm64 coverage that does NOT need a Mac stays automated on the cheap ubuntu runners:

- **darwin-arm64 DOWNLOAD recipes** → `mirror.yml` (every 6h, download-only, all platforms) + the Hetzner xdl fleet (continuous). No Mac.
- **new versions on update** → `publish-changed-packages.yml`, **download-first and ubuntu-first**: `linux-x86-64` + `linux-arm64` run `--pkgx-mirror` (mirror pkgx's prebuilt; source-build only what pkgx lacks or we customize — php/postgres — natively), and `darwin-arm64` runs FROM UBUNTU in two safe download passes (`--pkgx-mirror --mirror-only` for pkgx prebuilts, then `--download-only` for zig-style recipes — no source-build, no cross-compile). Apps/fonts are excluded here (handled by check-desktop-updates).
- **desktop apps + fonts** → `check-desktop-updates.yml` (daily). Discovery, the zip/archive publishes and the manifest commit are all ubuntu. `.dmg`/`.pkg` recipes need Apple's own tools — the userspace readers do not handle every DMG filesystem, which is what made Karabiner and LibreOffice fail silently — so they publish on a **gated** `publish-macos` job: the ubuntu discovery pass emits the out-of-date disk-image domains (`--platform=macos --print-selected`) and the Mac is allocated only when that list is non-empty, which is almost never. A skipped `publish-macos` counts as success for the `record` job, or the gate would wedge the only writer. (The darling-dmg/apfs-fuse/7zz shim is a **fleet-box** thing — `provision-build-workers.ts` builds it on the Hetzner workers — not something this workflow uses.)
- **darwin-arm64 SOURCE recipes** (pkgx has no prebuilt AND it's not a download recipe) genuinely need real Mac hardware. `publish-changed-packages.yml` handles these via a **tightly-gated `publish-darwin-native` macOS job**: the `detect` job computes the darwin-native set with `build-all-packages … --platform darwin-arm64 --source-only --print-selected`, and the macOS job runs **only if that set is non-empty** (`if: needs.detect.outputs.darwin_native != ''`) — so a pure pkgx/download update allocates NO macOS runner. It builds only those domains `--source-only --pkgx-mirror` **without `--force`**, so anything the ubuntu legs already published is skipped and only true pkgx-misses compile. This is one of the two narrow macOS paths that run automatically (the other being check-desktop-updates' `publish-macos`) — it exists specifically so a genuine darwin update is published properly instead of silently skipped. Everything else macOS stays `workflow_dispatch`-only (a supervised `Build` dispatch).

**Publish-on-update is ubuntu-only.** `update-packages.yml` (hourly; `drain-release-queue.yml` dispatches it within minutes of a release, and a dispatch escapes GitHub's scheduled-workflow throttling) commits version bumps, then dispatches `publish-changed-packages.yml` so the registry updates AS bumps land — on ubuntu, never macOS. Set pantry up BEFORE `bun install` in any job that does both: the Setup Pantry action runs `pantry install`, which lays out node_modules itself, and slotting it between `bun install` and the steps that need node_modules is what broke this workflow for three days in September 2026. It **dispatches explicitly** (`gh workflow run`) rather than relying on publish-changed's `push` trigger, because bot commits are pushed with `GITHUB_TOKEN` (no `PAT_TOKEN` secret is set) and `GITHUB_TOKEN` pushes do not fire other workflows' `push` triggers — that suppression is exactly why version updates never used to publish. It previously dispatched `build.yml -f platform=unix`, which source-compiled every bump on a macOS-15 runner unsupervised; that path is gone.

## Build-status dashboard reporting (authenticated — the same token)

The live build dashboard at **pantry.dev/packages** is fed by builders POSTing `building`/`built`/`failed` events to `registry.pantry.dev/api/build-events` (and log lines to `/api/build-logs`). These endpoints are **authenticated** — the server (`packages/registry/src/server.ts`, `isAuthorizedRequest`) returns **401** without a valid `Authorization: Bearer <token>`. The reporter (`packages/ts-pantry/scripts/report-build.ts`) reads the token from `PANTRY_REGISTRY_TOKEN` → `PANTRY_TOKEN` → `PANTRY_BUILD_REPORT_TOKEN`, and **silently skips** reporting if none is set (a 401 never fails the build — reporting is fire-and-forget). The token is the **same `ptry_` registry token** used for publishing.

**The failure mode:** a build channel with no token compiles fine but is **invisible on the dashboard** (every POST 401s). So every channel that runs `build-all-packages.ts` MUST have the token in its environment — which channel gets it from where is recorded in [pantry-pm/ops](https://github.com/pantry-pm/ops).

**Rule going forward: any new build workflow or build host must export `PANTRY_REGISTRY_TOKEN` (= `secrets.PANTRY_TOKEN` in CI) or its builds won't show on the dashboard.** `report-build.ts` tags each event with a `hostKind` (`github` / `hetzner` / `local`), so a channel that has silently stopped reporting shows up as a missing `hostKind` in `GET /api/build-status` — the quickest way to detect a token/reporting regression. Set `PANTRY_BUILD_REPORT=0` only to intentionally disable reporting. `build-zig.yml` does not report (it doesn't run `build-all-packages.ts`), so it needs no token.

## Object storage provider (Hetzner / Backblaze / S3)

Registry object storage is **provider-agnostic** (AWS S3, Hetzner Object Storage, Backblaze B2 — all S3-compatible, SigV4). **Hetzner is the chosen low-cost target.** Selection is via `STORAGE_PROVIDER` (`aws` default). Resolution lives in `packages/registry/src/storage/provider.ts` (which builds the vendored `S3Client`) and ts-cloud's `createObjectStorageClient` (used by the `ts-pantry` upload/download scripts). On a non-AWS provider, registry metadata is stored as a JSON object in the bucket (`ObjectMetadataStorage`, `metadata/registry-index.json`) instead of DynamoDB — so the registry runs fully off AWS. The **server now runs on a Hetzner box** (`registry.pantry.dev`), not EC2.

- Env: `STORAGE_PROVIDER`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (auto-derived if unset), `S3_FORCE_PATH_STYLE`, `METADATA_BACKEND` (`object`|`dynamodb`|`file`), creds `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` (provider-agnostic; `HETZNER_S3_*` / `B2_*` are checked first if set).
- Workflows `build.yml` / `sync-binaries.yml` read repo **variables** (`STORAGE_PROVIDER`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`) + **secrets** (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`). Unset ⇒ stays on S3.
- Point the registry server (Hetzner) at the provider: `pantry registry storage --host registry.pantry.dev …` (SSHes in, writes the storage env into the unit's EnvironmentFile, restarts). The registry-operations shell scripts were replaced by the `pantry registry` command group (`packages/zig/src/cli/commands/registry_ops.zig`) — do not re-add scripts for this.
- Full setup + how to obtain credentials: `docs/object-storage.md`.
- Buckets stay **private**; the registry server proxies `registry.pantry.dev/binaries/...`.
- **Analytics** also persist off-AWS on non-AWS providers: `ObjectAnalytics` (`analytics/registry-analytics.json`) replaces the previously **ephemeral in-memory** prod analytics and DynamoDB analytics, so download tracking survives restarts. Per-package download counts persist via the object metadata store (`incrementDownloads`). On AWS the prior behavior (DynamoDB if `DYNAMODB_ANALYTICS_TABLE` set, else in-memory) is unchanged.

## Object storage egress — what it costs and what protects it

Hetzner Object Storage includes **about 1 TB/month of external traffic per
account**, separate from Cloud server traffic. The exact allowance accrues
hourly (1.116 TB in a full 31-day month). Do not mistake the old 5 TB application
alert budget for the provider's free allowance. External overage is $1.20/TB;
ingress and transfers within `eu-central` are free. Egress is the metric to watch, and
it comes from four places. Anything you add near the download or scan path
should be checked against this list.

1. **Artifact downloads** (the bulk). `ziglang.org` alone was ~1.3 TB — its
   artifacts are ~89 MB and CI pulled a fresh one on nearly every job. See the
   Zig rolling-pin rule below.
2. **The malware scanner re-downloading artifacts.** Every scan streams the full
   artifact out of the bucket. This is free internal traffic when both ends are
   in Hetzner's `eu-central`; GitHub-hosted backfills are external egress.
   A clean verdict is now cached by digest at
   `attestations/sha256/<digest>.json` and reused for 7 days
   (`PANTRY_SCAN_ATTESTATION_REUSE_HOURS`), so republishing unchanged bytes no
   longer re-scans them. Scans that fail to reach a verdict back off 15m → 6h
   per digest instead of retrying immediately.
3. **Per-request manifest reads.** `binaries/<domain>/metadata.json` is memoized
   for 60s and invalidated on publish. **Any new write path to a manifest must
   call `invalidateBinaryMetadata(domain)`.**
4. **Unbounded clients.** `/binaries/` tarball downloads are budgeted per client
   IP per hour — `PANTRY_BINARY_RATE_LIMIT_REQUESTS_PER_HOUR` (600) and
   `PANTRY_BINARY_RATE_LIMIT_GIB_PER_HOUR` (20); either at `0` disables that
   dimension. Over budget returns 429 + `Retry-After`.

Two rules that are easy to undo by accident:

- **Presigned download URLs are signed from a rounded hourly boundary**, not
  from "now" (`presignBinaryDownload`). A per-request signature makes every
  response uncacheable by anything downstream, which is what made repeat
  installs of the same immutable tarball pay full price each time. The 302's
  `max-age` is derived from the signature's *remaining* life — never hard-code
  one, or cached redirects will outlive their URL and 403.
- **`ziglang.org: "0.17.0-dev"` is a rolling spec, but a `pantry.lock` pin on it
  is reused when the registry still publishes that exact build**
  (`shouldUseLockedVersion`). The old always-resolve-newest behaviour existed
  because *ziglang.org* deletes old dev archives — we install from our own
  registry, which retains them. Do not restore the unconditional refusal.

`/binaries/` answers `HEAD`. Use it for existence/freshness checks rather than a
GET that throws the body away. HEAD must return headers locally from the
validated manifest: never download/materialize an archive, count its bytes,
spend the download budget, or redirect to a URL signed for GET (SigV4 binds the
method). Keep the same quarantine and attestation gates as GET.

Download-only mirror jobs and metadata integrity checks need Bun, not the Zig
workspace: use `packages: bun.sh` in their setup action. Native dependency cache
restore prefixes include platform and artifact digests, but allow reuse across
CLI patch releases; a prefix hit must still reconcile with the current CLI.

## Publish latency: what a stalled publish is actually waiting for

A mirror stripe that took 176 minutes spent 148 of them on **two 370MB
`solr.apache.org` uploads, 73.8 minutes each**, both ending in "Binary upload
completion remained ambiguous". None of that was compiling or transferring.

**`GET /api/build-status` carries the verdict, reason and duration** for every
recent failure — read it before theorising from log gaps. For solr it said
`reason=scanner coverage limit exceeded: Heuristics.Limits.Exceeded.MaxFiles
durationMs=855417`: clamd scanned for 14 minutes, hit its own `MaxFiles`, and
reported incomplete coverage. The publisher then polled that **130 times** over
the rest of its hour, because a coverage limit was dressed as a retryable 503.

Coverage limits are DETERMINISTIC — identical bytes against identical engine
configuration produce them every time — so:

- **`isScanCoverageLimitReason` ⇒ 422 `MALWARE_SCAN_COVERAGE_LIMIT`, never a
  retryable 503, and no digest backoff.** The artifact is rejected once, naming
  the limit to raise, and a config change takes effect on the very next attempt.
- **Production clamd must not be stricter than the backfill's clamd**
  (`.github/actions/setup-clamav`), which scans these same artifacts.
  `MaxFiles` was 100000 in `deploy-registry.yml` and `registry_ops.zig` against
  1000000 there; solr.apache.org and neo4j.com had been unpublishable on that
  gap since June. `publication-boundaries.test.ts` now pins both.
- `Heuristics.Limits.Exceeded.MaxFileSize` cannot be fixed by raising a limit —
  a member above the engine's per-file ceiling is unscannable whole at any
  setting. The publish path falls back to **entry-wise scanning**
  (`scanArchiveEntries`, `packages/registry/src/archive-entry-scan.ts`), the
  same technique `backfill-malware-scans.ts` uses for retained artifacts and
  now the same code: two copies would drift apart from the engine's limits.
  This is MORE coverage than the pass that gave up, since it opens exactly the
  members that pass skipped — a member the engine errors on still fails closed,
  and one it blocks blocks the archive.
- **The artifact cap is 4 GiB, and every limit around it moves with it**
  (`DEFAULT_MAX_BINARY_BYTES`, `CLAMD_MAX_BYTES`, clamd `StreamMaxLength`). At
  1 GiB it was not protecting anything: `flutter.dev` (2140 MB) and `llvm.org`
  (1714 MB) are already published and served at twice it, so the cap only
  refused NEW versions of packages we hand out on every install. A scanner
  limit below the publish limit is a fail-closed rejection of our own catalog.
- **`OVERSIZED_ARCHIVE_BYTES` (1 GiB) is derived from the measured scan rate**,
  not chosen: solr's 386 MB scanned in 1,061,297 ms ≈ 2.7 s/MB, and 2700 s of
  budget divided by that is ~1 GB. Above it the whole-archive pass is skipped
  entirely — it would spend the entire budget to return a foregone
  `Heuristics.Limits.Exceeded`. Re-derive it if the budget or the engine's
  throughput changes.
- **The isolated worker stages the artifact on disk before scanning**, because
  the fallback reads the archive a second time and the alternative is paying
  its egress twice. `PANTRY_SCANNER_SCRATCH_DIR` must therefore point at DISK
  and must reach the transient unit (it is in the `--setenv` list): the default
  is the host's `/tmp`, and where that is a tmpfs the staged file is charged to
  the worker's own `MemoryMax=1G` and kills the scans this exists to enable.
  **Staging is an enhancement, never a requirement**: `prepareScratchDirectory`
  preflights the free space and returns null when the volume cannot hold the
  artifact, and the worker then streams straight into clamd exactly as it did
  before, losing only the entry-wise retry. A host whose disk is too small must
  lose a capability, not the ability to publish at all. The preflight is a
  space check rather than a try/catch because a write that fails halfway has
  already consumed the download, and recovering costs a second one.
  Entry-wise scanning itself is cheap in memory — measured on the real
  llvm.org 23.1.0 darwin-arm64 artifact (1576 MB compressed, 5.68 GB unpacked,
  11,116 members, largest 192 MB): 15 s to walk, peak RSS 94 MB. It is the
  staged FILE that needs room, not the process.

Three more rules hold the *other* stall shapes shut:

- **Mint the scan's presigned URL AFTER admission, never before**
  (`ScanUrlSource` is a thunk for exactly this reason). The URL's lifetime is
  sized against `scanBudgetMs`; `ClamAvScanner.scanUrl` then queues behind
  `maxConcurrentScans` (2). Minting at call time charges the queue wait against
  the signature, and the download 403s partway through — reported as
  `MALWARE_SCAN_UNAVAILABLE ... artifact download failed with HTTP 403`, which
  is indistinguishable from a dead scanner.
- **An overloaded scanner must not put the artifact into backoff.**
  `recordScanFailure` earns a 15m → 6h per-digest wait, which is right for a
  scan that reached no verdict and wrong for one that never ran. Overload is
  identified by `isScannerOverloadReason` and answered with a 90s `Retry-After`.
- **The admission queue is bounded by TIME as well as depth**
  (`CLAMD_MAX_ADMISSION_WAIT_MS`, 10 min). 32 waiters against a handful of
  slots and a 45-minute budget is a many-hour queue; the publisher stops after
  one hour, and the scan it was waiting for then finishes into a void with the
  artifact unpublished. Shedding is the honest answer.
- **A shed must carry a retry interval that reflects the QUEUE**, not a
  constant (`queueDrainSeconds`, from `malwareScanMetrics().durationMs.average`
  and the current depth). A flat 90s against a 600s admission cap is a
  busy-loop: the publisher comes straight back, waits out the cap again, and is
  shed again — measured at 57 attempts over 3511s for one artifact, all of it
  contending for slots it was never going to get. With a real interval, a
  publisher whose budget cannot cover it gives up at once and stops competing.
- **Scan concurrency and clamd's `MaxThreads`/`MaxQueue` move together or not
  at all.** `DEFAULT_MAX_CONCURRENT_ISOLATED_SCANS` is 4 against `MaxThreads 4`
  / `MaxQueue 8`; raising either alone was tried and only relocated the queue
  into clamd, where the wait surfaces as a timeout instead of as throughput.
  The 2-slot configuration measured **83% utilisation** in one sweep — 372
  slot-minutes of successful scanning against ~450 available — which is where
  queueing delay explodes, and a further 264 minutes were lost to publishes
  shed while waiting. Staging the artifact on disk is what made the raise
  affordable: a worker is now flat at ~94 MB rather than peaking near 529 MB.

The publisher side matches: `completeBinaryUpload` honours `retryAfterSeconds` /
`Retry-After` and **stops immediately when the declared wait exceeds its own
deadline**, instead of polling out the remainder of an hour for an answer the
registry already decided.

## Finding the cost driver: per-package timings, not log archaeology

`build-all-packages.ts` records every attempt in a timing ledger — `totalMs`
plus a phase split (`exists`, `mirror`, `build`, `package`, `upload`) — and
prints a `⏱` line per package as it finishes, a "Slowest packages" table in the
run summary and the job summary, and the full record to `--timing-json`
(`PANTRY_TIMING_JSON`; `mirror.yml` uploads it as a `timings-*` artifact).

Read the **"attributed to packages"** share first. A stripe reporting a few
seconds of timed work across a 176-minute job is a measurement gap, not a fast
stripe — that gap is what pointed at the phase nobody was timing. Keep every
new early return inside `buildPackage` (the wrapper `buildAndUpload` times it),
and never print a completion line without its duration.

`PANTRY_BATCH_BUDGET_MIN` (default 100, `mirror.yml` sets 210) is how long a run
keeps *starting* packages. It does not interrupt work in flight, so leave a tail
under the job's `timeout-minutes` for the package still running. It was pinned
to 100 against a step timeout that no longer existed, which silently truncated
every sweep at a third of its allowance.

A targeted run (`-p`) that selects nothing now **exits 1** — "asked for X, built
nothing" was reported as success. Pass `--allow-empty` where an empty selection
is legitimate (build-residual dispatches one list across a platform matrix).

### Measuring it: `GET /api/egress`

**Host network metrics cannot see artifact egress and never will.** Downloads are
a 302 to object storage, so the bytes never cross the registry box's NIC — the
server can look idle while the bucket serves terabytes. Any dashboard reading
`/proc/net/dev` on the box is answering a different question.

The registry therefore keeps its own day-bucketed ledger of bytes it authorized
(`analytics/registry-egress.json`, persisted, throttled to one write a minute).
`GET /api/egress` reports today, month-to-date, the share of an optional
`PANTRY_EGRESS_BUDGET_TB` allowance, package byte rankings, observed dates, and a
month-end projection from the observed period. Set that env var to the plan's
allowance so the projection is meaningful. It counts GET bytes *authorized*, not
completed, and with a CDN it counts client downloads rather than cache misses.
Direct bucket reads, CI, and scanner traffic bypass it. History recorded before
the HEAD correction can include probe bytes; never use it as an invoice meter.

### Cloudflare: R2 yes, free CDN in front of Hetzner no

Cloudflare removed the old §2.8 non-HTML restriction in 2023, but moved it into
the Service-Specific Terms rather than dropping it: **large files hosted outside
Cloudflare are still restricted on the CDN**, and explicitly permitted when the
content is hosted by a Cloudflare service such as R2. Multi-TB of tarballs
proxied from a Hetzner bucket through the free CDN is exactly the restricted
case — it works until someone notices.

- **R2 is a supported path for large downloads**: `$0` egress removes the
  transfer charge, but its higher storage price and billable operations mean
  it is not automatically cheaper overall. Compare stored GB and actual
  external egress first. `STORAGE_PROVIDER=r2` is supported
  (account-scoped endpoint via `R2_ACCOUNT_ID`, `auto` region, path-style
  addressing — virtual-host addressing 404s on R2).
- **`S3_CDN_BASE_URL` is what makes any CDN work.** Set it to the public CDN
  origin for the bucket and the tarball redirect points there with a plain
  immutable URL instead of a presigned one. This matters more than it looks: a
  presigned URL is unique per request, so a CDN in front of signed URLs caches
  nothing. Only set it for a bucket whose objects are genuinely public.
- **WAF / edge rate limiting is worth having regardless** — it protects the
  registry API (JSON/HTML, squarely permitted) and costs no origin work. If you
  put Cloudflare in front, the in-process limiter keeps working: it reads
  `CF-Connecting-IP` first precisely because that header cannot be forged.

## Where a package's versions come from (and what cannot override it)

`src/recipes/<domain>.ts` → `versionSource` is the **single authority** for which
versions a package has. Fix a version problem there and nowhere else; the fix is
permanent by construction, not by convention:

- `version-fetcher.ts` reads `versionSource` and merges the result into
  `src/packages/<key>.ts`, newest first. It **merges and never removes**, so a
  wrong pattern poisons a catalog permanently — which is why a fix should be
  verified with `--dry-run --domain <d>` before it lands.
- **pkgx cannot introduce a version.** `pkgx-sync.yml` scaffolds `src/packages/`
  only for domains `discover-pkgx-new.ts` reports as absent (`!existsLocally`),
  so a package we already have is never re-scaffolded, and nothing on that path
  writes `src/recipes/` at all. `--pkgx-mirror` supplies *binaries* for versions
  the catalog already lists; it does not decide what those versions are.
- `sync-packages.ts` has its own hand-coded `getLatestVersion()` for the 19
  binary-sync domains, but it only publishes artifacts — it does not write the
  catalog. When it drifts ahead of the catalog (go.dev did, by a whole minor),
  the recipe is what is wrong, not the registry.

A `versionSource` that resolves nothing is therefore a silent freeze: the
package keeps whatever was last committed, forever, and the sweep reports
"0 errors". 81 recipes were in that state; 76 are fixed and the remaining 5 are
listed in `KNOWN_NO_VERSION_SOURCE` with a reason each, so the sweep's warning
fires only for a genuinely NEW one. `version-fetcher --dry-run` prints the same
split locally. Removing an entry from that map is the point of it — it records
work outstanding, not a permanent excuse.

Two recipes were found reading a **fork they never build** (openssl.org pointed
at quictls while downloading from www.openssl.org; ordinals.com pointed at the
`casey/ord` fork while its own `github:` field and download URL said
`ordinals/ord`). Both resolved nothing, which is the only reason neither
produced a wrong artifact. Worth checking as a class: `versionSource.repo`
should name the same project as `distributable.url`.
The shapes that bite, all seen in that batch: a `tagPattern` that never matches
(`boost-1.92.0` against `/^v(.+)$/`), a repo whose releases are *all* flagged
prerelease (needs `stable: false`), a repo with no releases at all (needs
`github-tags`), monorepo tags where the product's own tag must be anchored
(`/^appium@.../` — an unanchored scan picks `@appium/support@7.x`), and
newest-tag-is-an-rc on `github-tags`, which carries no prerelease flag (use a
strictly-numeric capture so `3.15.0rc2` cannot match; keep it bounded —
`(\d+(?:\.\d+){0,3})` — because the unbounded form is super-linear
backtracking and pickier rejects it).

Multi-group patterns are joined with dots, which is how underscore schemes work:
`/^R_(\d+)_(\d+)_(\d+)$/` turns `R_2_8_4` into `2.8.4`.

## pkgx new-package sync

`pkgx-sync.yml` (daily) watches `pkgxdev/pantry` for packages we don't have and opens **one PR per new package** (label `pkgx-sync`). `scripts/discover-pkgx-new.ts` diffs pkgx's project list against `packages/ts-pantry/src/packages/*.ts` (by `convertDomainToFileName`); the workflow scaffolds each new formula via `pantry fetch <domain>` on its own branch. Index/aliases are regenerated post-merge by `update-packages.yml` (so per-package PRs don't conflict). This complements `update-packages.yml`, which only bumps versions of **existing** packages.

## GitHub Action (`packages/action/`)

The Setup Pantry action (`pantry-pm/pantry/packages/action@main`):

- Default behavior: installs pantry CLI + runs `pantry install` (reads `pantry.jsonc`/`deps.yaml`)
- Built-in caching: caches `pantry/` dir keyed on `pantry.lock` hash
- Installs bun via pantry, creates `bunx` symlink, sets `BUN_INSTALL` env var
- Use `install: 'false'` to skip `pantry install` (just CLI in PATH)
- For local repo: `uses: ./packages/action`
- For external repos: `uses: pantry-pm/pantry/packages/action@main`

## Deps Files

- `pantry.jsonc` — system deps (zig, bun, zig-libs). Read by `pantry install`.
- `deps.yaml` — alternative format for system deps. Same purpose as `pantry.jsonc`.
- `package.json` — JS/TS deps. Read by `bun install`.
- Use domain names (`bun.sh`, `ziglang.org`) in deps files until aliases (`bun`, `zig`) are in a released pantry binary.
