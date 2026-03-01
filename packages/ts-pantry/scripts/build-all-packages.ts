#!/usr/bin/env bun

/**
 * Build All Packages — Batch builder for pantry packages
 *
 * Discovers all packages from pantry YAML files, builds them using buildkit,
 * and uploads to S3. Supports batching for CI parallelization.
 *
 * Usage:
 *   bun scripts/build-all-packages.ts -b <bucket> [options]
 *
 * Options:
 *   -b, --bucket <name>      S3 bucket (required)
 *   -r, --region <region>    AWS region (default: us-east-1)
 *   --batch <N>              Batch index (0-based)
 *   --batch-size <N>         Packages per batch (default: 50)
 *   --platform <platform>    Override platform detection
 *   -p, --package <domains>  Comma-separated specific packages to build
 *   -f, --force              Re-upload even if exists in S3
 *   --multi-version          Build multiple important versions per package
 *   --max-versions <N>       Max versions per package (default: 5)
 *   --count-only             Just print total buildable package count and exit
 *   --list                   List all buildable packages
 *   --dry-run                Show what would be built
 *   -h, --help               Show help
 */

import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'
import { S3Client } from '@stacksjs/ts-cloud/aws'
import { uploadToS3 as uploadToS3Impl } from './upload-to-s3.ts'
import { packageOverrides } from './package-overrides.ts'

// Import package metadata
const packagesPath = new URL('../src/packages/index.ts', import.meta.url).pathname
// eslint-disable-next-line ts/no-top-level-await
const { pantry } = await import(packagesPath)

// Parse YAML using Bun's built-in YAML parser (spec-compliant, written in Zig)
function parseYaml(content: string): Record<string, any> {
  return Bun.YAML.parse(content) as Record<string, any>
}

// --- Package Discovery ---

interface BuildablePackage {
  domain: string
  name: string
  latestVersion: string
  versions: string[] // All available versions for fallback
  pantryYamlPath: string
  hasDistributable: boolean
  hasBuildScript: boolean
  needsProps: boolean
  hasProps: boolean
  depDomains: string[] // Domains this package depends on (for ordering)
}

function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// Build a reverse lookup from domain → pantry key, since auto-generated keys
// use collision suffixes (e.g. xorgprotocol1 for x.org/protocol/xcb) that
// don't match domainToKey output (xorgprotocolxcb).
const _pantryDomainMap = new Map<string, string>()
for (const [key, val] of Object.entries(pantry as Record<string, any>)) {
  if (val && typeof val === 'object' && typeof val.domain === 'string') {
    _pantryDomainMap.set(val.domain, key)
  }
}

function lookupPantryPackage(domain: string): any {
  // Try direct key first (works for most packages)
  const directKey = domainToKey(domain)
  const direct = (pantry as Record<string, any>)[directKey]
  if (direct?.versions) return direct

  // Fall back to domain-based reverse lookup (handles collision-resolved keys)
  const mappedKey = _pantryDomainMap.get(domain)
  if (mappedKey) return (pantry as Record<string, any>)[mappedKey]

  return null
}

interface BuildPlatformInfo {
  platform: string
  os: string
  arch: string
}

function detectPlatform(): BuildPlatformInfo {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return { platform: `${os}-${arch}`, os, arch }
}

/**
 * Discover all buildable packages from pantry YAML files
 */
function discoverPackages(targetPlatform?: string): BuildablePackage[] {
  const pantryDir = join(process.cwd(), 'src', 'pantry')
  const packages: BuildablePackage[] = []
  // Parse target platform for filtering
  // Split on first hyphen only (e.g. "linux-x86-64" → ["linux", "x86-64"])
  const dashIdx = targetPlatform ? targetPlatform.indexOf('-') : -1
  const targetOs = dashIdx > 0 ? targetPlatform!.slice(0, dashIdx) : (targetPlatform || '')
  const targetArch = dashIdx > 0 ? targetPlatform!.slice(dashIdx + 1) : ''
  const targetOsName = targetOs === 'darwin' ? 'darwin' : targetOs === 'linux' ? 'linux' : ''
  const targetArchName = targetArch === 'arm64' ? 'aarch64' : targetArch === 'x86-64' ? 'x86-64' : targetArch === 'x86_64' ? 'x86-64' : ''

  // Recursively find all package.yml files
  function findYamls(dir: string, prefix: string = ''): void {
    if (!existsSync(dir)) return
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        findYamls(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name)
      } else if (entry.name === 'package.yml') {
        const domain = prefix
        if (!domain) continue

        const yamlPath = join(dir, entry.name)
        try {
          const content = readFileSync(yamlPath, 'utf-8')
          const recipe = parseYaml(content)

          // Check platform compatibility (override supportedPlatforms take precedence over recipe)
          const override = packageOverrides[domain]
          const recipePlatforms = override?.supportedPlatforms ?? recipe.platforms
          if (targetOsName && recipePlatforms) {
            const platforms = Array.isArray(recipePlatforms) ? recipePlatforms : [String(recipePlatforms)]
            const isCompatible = platforms.some((p: string) => {
              const ps = String(p).trim()
              if (ps === targetOsName) return true
              if (ps === `${targetOsName}/${targetArchName}`) return true
              return false
            })
            if (!isCompatible) {
              continue // Skip: platform not supported (continue, not return, to allow child dirs)
            }
          }

          const hasDistributable = !!(recipe.distributable?.url) || Array.isArray(recipe.distributable)
          const isVendored = Array.isArray(recipe.warnings) && recipe.warnings.includes('vendored')
          const hasBuildScript = !!(recipe.build?.script) || Array.isArray(recipe.build) || typeof recipe.build === 'string'

          // Check if build script references props/
          const needsProps = content.includes('props/')
          const hasPropsDir = existsSync(join(dir, 'props'))

          // Look up version from package metadata
          const pkg = lookupPantryPackage(domain)

          if (!pkg || !pkg.versions || pkg.versions.length === 0) {
            // No version data available, skip (continue to allow child dirs)
            continue
          }

          if (!hasDistributable && !isVendored) {
            // No source to download and not a vendored package, skip
            continue
          }

          // Extract dependency domains for ordering (from both TS metadata and YAML)
          const depDomains: string[] = []
          const allDeps = [...(pkg.dependencies || []), ...(pkg.buildDependencies || [])]
          for (const dep of allDeps) {
            const depDomain = dep.replace(/@.*$/, '').replace(/\^.*$/, '').replace(/>=.*$/, '').replace(/:.*$/, '').trim()
            if (depDomain) depDomains.push(depDomain)
          }
          // Also extract YAML build deps for ordering
          const yamlBuildDeps = recipe.build?.dependencies
          if (yamlBuildDeps && typeof yamlBuildDeps === 'object') {
            for (const key of Object.keys(yamlBuildDeps)) {
              if (key.includes('.') || key.includes('/')) depDomains.push(key)
              // Handle platform-specific nested deps
              if (/^(?:darwin|linux)/.test(key) && typeof yamlBuildDeps[key] === 'object') {
                for (const subKey of Object.keys(yamlBuildDeps[key])) {
                  if (subKey.includes('.') || subKey.includes('/')) depDomains.push(subKey)
                }
              }
            }
          }

          packages.push({
            domain,
            name: pkg.name || domain,
            latestVersion: pkg.versions[0],
            versions: pkg.versions,
            pantryYamlPath: yamlPath,
            hasDistributable,
            hasBuildScript,
            needsProps,
            hasProps: hasPropsDir,
            depDomains,
          })
        } catch {
          // Skip packages with parse errors
        }
      }
    }
  }

  findYamls(pantryDir)

  // Topological sort: packages with fewer deps come first
  // This ensures dependency packages are built before their dependents
  const domainSet = new Set(packages.map(p => p.domain))

  // Count how many buildable deps each package has
  function countBuildableDeps(pkg: BuildablePackage): number {
    return pkg.depDomains.filter(d => domainSet.has(d)).length
  }

  // Sort by dependency depth (packages with 0 buildable deps first),
  // then alphabetically for deterministic ordering within same depth
  packages.sort((a, b) => {
    const depCountA = countBuildableDeps(a)
    const depCountB = countBuildableDeps(b)
    if (depCountA !== depCountB) return depCountA - depCountB
    return a.domain.localeCompare(b.domain)
  })

  return packages
}

// --- Version Selection ---

// Versions with fundamental toolchain incompatibilities that can't be resolved with overrides.
// These are skipped during multi-version builds because they fail deterministically.
// Key: package domain, Value: array of version specs to skip
//   - Exact version: '14.0.1' — skips that specific version
//   - '*' — skips ALL versions (package can't be built with current S3 deps)
const SKIP_VERSIONS: Record<string, string[]> = {
  // clap_mangen 0.2.31 uses private get_display_order() from clap_builder 4.6.0
  'crates.io/topgrade': ['14.0.1'],
  // nix crate restructured API — Pid, SigSet, Signal, sigaction moved/feature-gated
  'just.systems': ['<1.43.0'],
  // Old time crate v0.3.30 incompatible with newer rustc (type annotations needed)
  'gleam.run': ['<1.0.0'],
  // gnu.org/diffutils 3.2.0: gets() removed from glibc 2.32+ — FIXED via override
  // (prependScript patches c-stack.c SIGSTKSZ and stdio.h gets() warning)
  // fermyon.com/spin: wasm32-wasi target renamed to wasm32-wasip1 in Rust 1.93+;
  // spin's build.rs hardcodes wasm32-wasi which can't be fixed via overrides
  'fermyon.com/spin': ['*'],
  // Go 1.26 breaks vendored tokeninternal + linker/timeout issues.
  // Only Go 1.26 is available in S3. All versions below 0.13 fail.
  'cuelang.org': ['<0.13.0'],
  // gvisor build constraints exclude all Go files under Go 1.26 (gohacks package).
  // Old flyctl versions use old gvisor which is incompatible with Go 1.26.
  'fly.io': ['<0.3.0'],
  'github.com/containers/gvisor-tap-vsock': ['<0.7.0'],
  // frizbee crate restructured (E0405/E0425/E0432) + edition2024 issues — newer skim versions work
  'crates.io/skim': ['<3.0.0'],
  // Cython 0.29.x uses _PyLong_AsByteArray(5 args) — Python 3.14 needs 6 args.
  // Only Python 3.14 available on linux. Newer Cython 3.x already in S3.
  'cython.org/libcython': ['<3.0.0'],
  // Python 3.14 removed distutils; mkdocs 1.5.3 depends on babel→distutils.
  // mkdocs 1.6+ already in S3 and works fine.
  'mkdocs.org': ['1.5.3'],
  // Old ko.build 0.16.0 fails with Go 1.26. Newer versions already in S3.
  'ko.build': ['0.16.0'],
  // lxml 4.x C extension incompatible with Python 3.14 API changes; 5.4.0+ works
  'lxml.de': ['<5.0.0'],
  // mac-notification-sys crate fails with Xcode 26.3 ("could not build module 'Darwin'"); 2.0.1+ works
  'moonrepo.dev/moon': ['<2.0.0'],
  // setuptools_scm generates post-release version from git state — FIXED via override
  // (SETUPTOOLS_SCM_PRETEND_VERSION forces correct version for 7.0.x tarball builds)
  // Old time crate v0.3.x incompatible with Rust 1.93+ (type inference error)
  'rust-lang.org/rustup': ['<1.28.0'],
  // Go 1.26 broke net.errNoSuchInterface in 1.9.x; 1.8.x and 1.10.x+ work
  'sing-box.app': ['1.9.0', '1.9.1', '1.9.2', '1.9.3', '1.9.4', '1.9.5', '1.9.6', '1.9.7'],
  // Xcode 26.3 SDK declares strchrnul, conflicting with pg_query_go's static version
  'sqlc.dev': ['<1.29.0'],
  // pygit2 C API mismatch with newer libgit2 (git_error_set renamed)
  'github.com/canonical/charmcraft': ['<5.0.0'],
  // Go x/tools v0.25.0 tokeninternal incompatible with Go 1.26 (constant expression error)
  'github.com/maxbrunsfeld/counterfeiter': ['<7.0.0'],
  'github.com/gotestyourself/gotestsum': ['<1.12.3'],
  // Rust linker failure on darwin with old versions (newer versions succeed)
  'crates.io/joshuto': ['<1.0.0'],
  'crates.io/rucola-notes': ['<1.0.0'],
  // Swift is macOS-only; old versions fail on linux
  'github.com/realm/SwiftLint': ['0.59.1'],
  // utfcpp 3.x: old cmake issues. 4.9.0: tag doesn't exist. Only 4.0.9 works.
  'github.com/nemtrif/utfcpp': ['<4.0.0', '4.9.0'],
  // duti configure broken on darwin24+ — FIXED via override
  // (env CFLAGS/LDFLAGS override + configure patching for arm64)
  // Gradle sourceCompatibility error in old version; 1.5.4/1.5.5 build fine
  'github.com/skylot/jadx': ['1.4.7'],
  // gnupg pinentry 1.2.1 requires old libassuan API; 1.3.0+ builds fine
  'gnupg.org/pinentry': ['1.2.1'],
  // Old samtools fail on linux (hts_version symbol mismatch); 1.23.0 works on both
  'htslib.org/samtools': ['<1.23.0'],
  // rav1e old versions missing libiconv on darwin; 0.8.1 works on both
  'github.com/xiph/rav1e': ['<0.8.1'],
  // Old time crate v0.3.x incompatible with Rust 1.93+ (type inference error);
  // lychee 0.15.1 (latest) builds fine
  'lychee.cli.rs': ['<0.15.1'],
  // pip requirements.txt missing trailing newline causes merged line; 3.8.1+ builds fine
  'localstack.cloud/cli': ['2.3.2'],
  // littlecms.com 2.12.0 — REMOVED: already built on linux (in S3), darwin failure is harmless
  // Requires python.org >=3<3.12 but only 3.14 available in S3.
  // Versions 1.15.0, 1.17.1, 1.18.2, 1.19.1 already in S3.
  'mypy-lang.org': ['1.16.0', '1.16.1'],
  // libiconv linking failure on darwin (libgit2-sys/onig-sys); built on linux.
  // Latest versions of each package work on both platforms.
  'crates.io/git-delta': ['<0.18.2'],
  'crates.io/bat': ['<0.26.0'],
  'crates.io/broot': ['<1.55.0'],
  'github.com/peltoche/lsd': ['<1.2.0'],
  // TryLockError API change in newer Rust; latest 0.10.0 works
  'crates.io/git-branchless': ['<0.10.0'],
  // npm cache corruption on old version; 1.18.3+ works
  'github.com/Everduin94/better-commits': ['1.17.1'],
  // Linux linker flags (-z, -soname) on macOS; 1.15.1+ works on both
  'webmproject.org/libvpx': ['<1.15.1'],
  // Old cmake bootstrap failure on darwin; 4.0.6+ works on both
  'cmake.org': ['<4.0.0'],
  // glm.g-truc.net — MOVED to darwinOnlyDomains (fails linux, works darwin)
  // Old GMP configure error; 6.3.0 works on both
  'gnu.org/gmp': ['<6.3.0'],
  // Go module incompatibility; 1.1.0+ works
  'go.dev/govulncheck': ['<1.1.4'],
  // Old Go build failure; 2.11.2+ works
  'goreleaser.com': ['<2.0.0'],
  // Old wails Go build failure; 2.9.3+ works
  'wails.io': ['<2.9.0'],
  // Old flywaydb Java failure; 11.20.3+ works
  'flywaydb.org': ['<11.0.0'],
  // Old cedar-agent Rust build failure; 0.2.0+ works
  'permit.io/cedar-agent': ['<0.2.0'],
  // Old himalaya Rust build failure; 1.2.0 works
  'pimalaya.org/himalaya': ['<1.2.0'],
  // Very old brewkit versions; 1.16.0+ works
  'pkgx.sh/brewkit': ['<1.0.0'],
  // Old geni versions fail or 404; 1.1.9+ works
  'priver.dev/geni': ['<1.0.0', '2023.12.27'],
  'github.com/yashs662/rust_kanban': ['0.9.7'],
  // Tarball 404 for croc 10.4.0
  'schollz.com/croc': ['10.4.0'],
  // Old capnproto C++ build fails on linux; 1.3.0 works on both
  'capnproto.org': ['<1.3.0'],
  // Old protobuf-c versions; 1.5.2 works on both
  'github.com/protobuf-c/protobuf-c': ['<1.5.2'],
  // Old vanna.ai Python build failure; 2.0.2 works on both
  'vanna.ai': ['<2.0.0'],
  // Old zlib tarballs removed from server (404); 1.3.1+ works
  'zlib.net': ['<1.3.1'],
  // Old Apache APR releases removed from mirrors (404)
  'apache.org/apr': ['<1.7.6'],
  // Old libsodium releases removed from download server (404)
  'libsodium.org': ['<1.0.19'],
  // Non-existent version (latest nasm is 2.x)
  'nasm.us': ['3.0.0'],
  // Non-existent tags (404)
  'github.com/sharkdp/hyperfine': ['0.17.0'],
  'github.com/digitalocean/doctl': ['2.59.2', '2.59.3'],
  // Phantom version — GitHub has v3.1.4 and v3.2.0, no v3.1.5 tag (404)
  'github.com/TomWright/dasel': ['3.1.5'],
  // mitmproxy.org 11.1.x — REMOVED: bpf-linker issue is linux-only, darwin builds should work
  // Old Rust build failures; 0.12.2+ works on linux, 0.10.1+ works on darwin
  'prql-lang.org': ['<0.12.0'],
  // Old scryer-prolog fails on darwin; 0.10.0 works on both
  'scryer.pl': ['0.9.4'],
  // Old sentry-cli fails on darwin (Rust libiconv); 3.2.0+ works on both
  'sentry.io': ['<3.2.0'],
  // Old typst fails (Rust build); 0.12.0+ works on both
  'typst.app': ['<0.12.0'],
  // Old ICU build fails; 74.2.0+ works. 78.2.0 is phantom (404).
  'unicode.org': ['<74.0.0', '78.2.0'],
  // Old xcb-proto fails (missing dep); 1.15.2+ works
  'x.org/protocol/xcb': ['<1.15.2'],
  // Old xrender fails; 0.9.12 (latest) works
  'x.org/xrender': ['<0.9.12'],
  // Old watchexec Rust build fails on darwin; 2.3.3+ works
  'watchexec.github.io': ['<2.3.0'],
  // Android cmdline-tools: corrupted S3 data and build failures on all versions
  'android.com/cmdline-tools': ['*'],
  // Old spdlog cmake failures; 1.15.3+ works on both
  'github.com/gabime/spdlog': ['<1.15.0'],
  // All versions fail (not installable via current recipe)
  'github.com/mamba-org/micro': ['*'],
  // inetutils 2.5.0 fails everywhere; 2.4.0/2.6.0 work on darwin, 2.7.0+ works on both
  'gnu.org/inetutils': ['2.5.0'],
  // bc 1.7.1 fails on linux; 1.8.0+ works on both
  'gnu.org/bc': ['<1.8.0'],
  // spotify_player Xcode 26.3 IOKit/CoreGraphics errors on darwin; 0.22.0+ works
  'crates.io/spotify_player': ['<0.22.0'],
  // mockgen 0.5.x fails (Go x/tools tokeninternal); 0.3.0, 0.4.0, and 0.6.0 work
  'go.uber.org/mock/mockgen': ['0.5.0', '0.5.1', '0.5.2'],
  // Old hurl.dev Rust build fails on darwin; 7.0.0+ works
  'hurl.dev': ['<7.0.0'],
  // convco Rust libiconv on darwin; 0.6.2+ works on both
  'convco.github.io': ['<0.6.2'],
  // gifsicle 1.95.0 fails on linux; 1.96.0 works
  'lcdf.org/gifsicle': ['1.95.0'],
  // Old whisper versions fail (Python/pip issues); only latest works
  'openai.com/whisper': ['<20250625.0.0'],
  // Old operator-sdk Go build failure; 1.39.2+ works
  'operatorframework.io/operator-sdk': ['<1.39.0'],
  // Old tailcall Rust build fails; only 1.6.14 (latest) works
  'tailcall.run': ['<1.6.0'],
  // Old version format (1.x) incompatible; date-based versions (24.x+) work
  'xtls.github.io': ['<24.0.0'],
  // git-crypt 0.7.0 fails on linux; 0.8.0 works
  'agwa.name/git-crypt': ['<0.8.0'],
  // fselect libiconv linker error on darwin; 0.10.0+ works on both
  'crates.io/fselect': ['<0.10.0'],
  // silicon 0.5.2 fails; 0.5.1 and 0.5.3 work
  'crates.io/silicon': ['0.5.2'],
  // Old cryptography.io Python/Rust build fails; 43.0.3+ works
  'cryptography.io': ['<43.0.0'],
  // xdg-user-dirs 0.18.0 fails on linux; 0.19.0 works
  'freedesktop.org/xdg-user-dirs': ['<0.19.0'],
  // oneTBB builds only on darwin; all versions fail on linux (cmake/threading)
  'github.com/oneapi-src/oneTBB': ['<2022.4.0'],
  // Old nushell Rust build fails on darwin; 0.108.0+ works
  'nushell.sh': ['<0.108.0'],
  // Old duckdb cmake fails on darwin; 1.1.3+ works on both (1.0.0 also fails)
  'duckdb.org': ['<1.1.0'],
  // Old pakku fails on darwin; 0.4.2+ works on both
  'github.com/mycreepy/pakku': ['<0.4.0'],
  // Old z3 cmake fails on darwin; 4.13.4+ works on both
  'github.com/Z3Prover/z3': ['<4.13.0'],
  // metis 5.2.1.1 fails (old cmake); 5.1.0.3+ and 5.2.1.2 work
  'glaros.dtc.umn.edu/metis': ['5.2.1.1'],
  // SPIRV-Tools cmake fails; 2025.2.0+ works
  'khronos.org/SPIRV-Tools': ['<2025.2.0'],
  // Old rtx-cli Rust build fails on darwin; 2025.12.13+ works on both
  'crates.io/rtx-cli': ['<2025.0.0'],
  // termusic Rust build fails (missing libprotoc); 0.13.0+ works
  'crates.io/termusic': ['<0.13.0'],
  // eas-cli npm/yarn build fails; 18.1.0+ works
  'expo.dev/eas-cli': ['<18.1.0'],
  // Old kubebuilder Go build fails; 4.10.1+ works
  'kubebuilder.io': ['<4.10.0'],
  // Old luarocks configure fails; 3.13.0 (latest) works
  'luarocks.org': ['<3.13.0'],
  // libxml2 cmake fails on darwin; 2.15.1+ works on both (2.15.0 also fails)
  'gnome.org/libxml2': ['<2.16.0'],
  // pkgx.sh 1.x fails; 2.5.0+ works on both
  'pkgx.sh': ['<2.0.0'],
  // Old pycairo fails on linux; 1.27.0+ works on both
  'cairographics.org/pycairo': ['<1.27.0'],
  // Old squawkhq Rust build fails on darwin; 2.40.1+ works on both
  'squawkhq.com': ['<2.0.0'],
  // Old wasmer Rust build fails on linux; 7.0.1 works on both
  'wasmer.io': ['<7.0.0'],
  // Old mise Rust build fails on darwin; 2025.12.13+ works on both
  'mise.jdx.dev': ['<2025.0.0'],
  // gitui Rust build fails on darwin; 0.27.0+ works (0.26.3 also fails)
  'crates.io/gitui': ['<0.27.0'],
  // Old dxc cmake fails; 1.8.2505.1+ works on both
  'microsoft.com/dxc': ['<1.8.0'],
  // Old gobject-introspection meson fails; 1.82.0+ works
  'gnome.org/gobject-introspection': ['<1.82.0'],
  // binutils: 2.44.0 download 404, 2.43.1/2.45.1 fail on darwin; widen range
  'gnu.org/binutils': ['<2.46.0'],
  // All versions fail (no working builds in S3)
  'imageflow.io/imageflow_tool': ['*'],
  // Old lftp fails; 4.9.3 works on both
  'lftp.yar.ru': ['<4.9.3'],
  // Old neovim cmake fails; 0.10.4+ works
  'neovim.io': ['<0.10.0'],
  // Old openmp cmake/LLVM version fails; 21.1.8 works
  'openmp.llvm.org': ['<21.0.0'],
  // All versions fail (no working builds in S3)
  'opensuse.org/libsolv': ['*'],
  // Monero: extremely slow build (~60min each), times out CI. Linux-only.
  'getmonero.org': ['*'],
  // fontconfig 2.16+ meson build regression + 2.17.0 download 404; 2.15.0 works
  'freedesktop.org/fontconfig': ['2.16.2', '2.17.0', '2.17.1'],
  // opus-codec old versions fail on darwin; 1.6.1+ works (1.6.0 also fails)
  'opus-codec.org': ['<1.6.1'],
  // sfcgal cmake fails on linux; 2.2.0+ works (2.0.0/2.1.0 also fail)
  'sfcgal.org': ['<2.2.0'],
  // doxygen 1.12.0 fails on darwin; 1.13.2+ works
  'doxygen.nl': ['<1.13.0'],
  // graphviz.org — MOVED to darwinOnlyDomains (fontconfig API mismatch on linux, works darwin)
  // kubectl old versions fail; 1.34.5+ works on both
  'kubernetes.io/kubectl': ['<1.34.0'],
  // faad2 old versions fail on darwin; 2.11.1 works on both
  'sourceforge.net/faad2': ['<2.11.1'],
  // gdk-pixbuf old version fails; 2.43.5+ works
  'gnome.org/gdk-pixbuf': ['<2.43.0'],
  // theora 1.1.1 fails; 1.2.0 works on both
  'theora.org': ['<1.2.0'],
  // edencommon old versions fail on darwin; 2026.2.23.0 works (2026.1.26.0 also fails)
  'facebook.com/edencommon': ['<2026.2.0'],
  // mvfst fails on both platforms (fizz API mismatch); needs version-matched deps
  'facebook.com/mvfst': ['*'],
  // harfbuzz — FIXED via PYTHONPATH override for giscanner on linux
  // Keep <12.0.0 for old versions that fail for other reasons
  'harfbuzz.org': ['<12.0.0'],
  // glib fails on both platforms (darwin build errors, linux msgfmt/libxml2); 2.88.0+ works
  'gnome.org/glib': ['<2.88.0'],
  // dozzle old versions fail; 10.0.4+ works on both
  'dozzle.dev': ['<10.0.0'],
  // elementsproject 22.x needs Boost::System library (header-only in Boost 1.90+)
  'elementsproject.org': ['<23.0.0'],
  // procps-ng watch old versions fail; 4.0.6 works
  'gitlab.com/procps-ng/watch': ['<4.0.6'],
  // HDF5 old versions fail to download (404); latest works
  'hdfgroup.org': ['2.0.0', '1.14.1'],
  // fbthrift old versions fail on darwin (glog header incompatibility); 2026.2.16.0 works
  'facebook.com/fbthrift': ['<2026.2.16.0'],
  // gtk4 linker errors on darwin; fails on darwin, works on linux
  'gtk.org/gtk4': ['<4.19.0'],
  // libvips GIR generation fails on darwin for all tested versions
  'libvips.org': ['<8.18.0'],
  // MariaDB server: extremely slow build (~60min each), times out CI
  'mariadb.com/server': ['*'],
  // starship fails on darwin (Xcode 26.3 mac-notification-sys); 1.25.0+ works
  'starship.rs': ['<1.25.0'],
  // cargo-c 0.9.32 fails on darwin; 0.10.0+ works
  'github.com/lu-zero/cargo-c': ['<0.10.0'],
  // jnv 0.2.3 fails on darwin; 0.3.0+ works
  'crates.io/jnv': ['<0.3.0'],
  // versio old versions fail on linux; 0.9.0+ works
  'crates.io/versio': ['<0.9.0'],
  // zellij old versions fail on linux; 0.41.0+ works
  'crates.io/zellij': ['<0.41.0'],
  // p11-kit 0.24.1 fails on linux; 0.25.0+ works
  'freedesktop.org/p11-kit': ['<0.25.0'],
  // libheif 1.19.8 fails on darwin; 1.20.0+ works
  'github.com/strukturag/libheif': ['<1.20.0'],
  // gnuplot — FIXED via libiconv override in package-overrides.ts
  // tdnf 3.6.3 fails on linux; 3.7.0+ works
  'github.com/vmware/tdnf': ['<3.7.0'],
  // elizaOS: massive Node.js monorepo (2659 pnpm packages), causes runner timeout
  'elizaOS.github.io': ['*'],
  // PHP 7.4/8.1 EOL, incompatible with libxml2 2.15.x / ICU4C C++17; 8.2+ works
  'php.net': ['<8.2.0'],
  // opencode.ai: native module resolution fails (parcel watcher darwin, husky linux)
  'opencode.ai': ['*'],
  // openresty: mercurial Python library path issue on darwin; 502 on linux
  'openresty.org': ['*'],
  // opensearch older versions fail (nmslib cmake unrecognized compiler)
  'opensearch.org': ['<3.3.0'],
  // ceres-solver 2.1.0 requires Eigen ~3.3 but only 5.0.1 available
  'ceres-solver.org': ['<2.2.0'],
  // ctags — FIXED via libiconv override in package-overrides.ts
  // apache thrift download failures (mirror issues)
  'apache.org/thrift': ['<0.21.0'],
  // gnu groff 1.24.0 download failure (ftpmirror.gnu.org)
  'gnu.org/groff': ['1.24.0'],
  // curlie — FIXED via go build override in package-overrides.ts
  // mbedtls old releases removed from GitHub (404)
  'tls.mbed.org': ['<3.6.0'],
  // nx 20.11.0 npm tarball missing (404)
  'nrwl.io/nx': ['20.11.0'],
  // iso-codes old Debian pool URLs broken (404)
  'debian.org/iso-codes': ['<4.20.0'],
  // openexr 3.2.126 phantom version (tag doesn't exist)
  'github.com/AcademySoftwareFoundation/openexr': ['3.2.126'],
  // putty — FIXED via override (URL used 'latest' instead of version, wrong domain key)
  // libass — FIXED via GLIBTOOL_FIX + libiconv override in package-overrides.ts
}

function isVersionSkipped(domain: string, version: string): boolean {
  const specs = SKIP_VERSIONS[domain]
  if (!specs) return false
  if (specs.includes(version) || specs.includes('*')) return true
  // Support version range specs: '<X.Y.Z' skips all versions below threshold
  for (const spec of specs) {
    if (spec.startsWith('<')) {
      const threshold = spec.slice(1)
      if (compareVersions(version, threshold) < 0) return true
    }
  }
  return false
}

/** Compare semver-like version strings. Returns <0 if a<b, 0 if a==b, >0 if a>b */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na !== nb) return na - nb
  }
  return 0
}

/**
 * Select important versions to build for a package.
 * Strategy:
 * 1. Always include latest version
 * 2. Include latest patch of each major version (e.g., 3.x, 2.x, 1.x)
 * 3. Include latest patch of each minor version within current major
 * 4. Cap at maxVersions total
 * 5. Skip sentinel versions (999.999.999, 0.0.0)
 * 6. Skip fundamentally unbuildable versions (SKIP_VERSIONS)
 */
function selectImportantVersions(pkg: BuildablePackage, maxVersions: number): string[] {
  const validVersions = pkg.versions.filter(v =>
    v !== '999.999.999' && v !== '0.0.0' && !isVersionSkipped(pkg.domain, v)
  )
  if (validVersions.length === 0) return []
  if (validVersions.length <= maxVersions) return validVersions

  const selected = new Set<string>()

  // Always include latest
  const latest = pkg.latestVersion !== '999.999.999' && pkg.latestVersion !== '0.0.0'
    ? pkg.latestVersion
    : validVersions[0]
  selected.add(latest)

  // Parse versions into components
  const parsed = validVersions.map(v => {
    const parts = v.split('.').map(Number)
    return { raw: v, major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 }
  })

  // Group by major version — pick latest from each major
  const byMajor = new Map<number, typeof parsed[0]>()
  for (const v of parsed) {
    const existing = byMajor.get(v.major)
    if (!existing || v.minor > existing.minor || (v.minor === existing.minor && v.patch > existing.patch)) {
      byMajor.set(v.major, v)
    }
  }
  // Add latest of each major (sorted by major descending)
  const majors = Array.from(byMajor.entries()).sort((a, b) => b[0] - a[0])
  for (const [, v] of majors) {
    if (selected.size >= maxVersions) break
    selected.add(v.raw)
  }

  // If still room, add latest patch of each minor within the current major
  if (selected.size < maxVersions) {
    const currentMajor = parsed[0]?.major ?? 0
    const byMinor = new Map<number, typeof parsed[0]>()
    for (const v of parsed) {
      if (v.major !== currentMajor) continue
      const existing = byMinor.get(v.minor)
      if (!existing || v.patch > existing.patch) {
        byMinor.set(v.minor, v)
      }
    }
    const minors = Array.from(byMinor.entries()).sort((a, b) => b[0] - a[0])
    for (const [, v] of minors) {
      if (selected.size >= maxVersions) break
      selected.add(v.raw)
    }
  }

  // Sort selected versions newest-first (same order as pkg.versions)
  return validVersions.filter(v => selected.has(v))
}

// --- S3 Helpers ---

async function checkExistsInS3(domain: string, version: string, platform: string, bucket: string, region: string): Promise<boolean> {
  try {
    const s3 = new S3Client(region)
    const metadataKey = `binaries/${domain}/metadata.json`
    const metadata = await s3.getObject(bucket, metadataKey)
    const parsed = JSON.parse(metadata)
    return !!(parsed.versions?.[version]?.platforms?.[platform])
  } catch {
    return false
  }
}

// --- Build & Upload ---

function tryBuildVersion(
  domain: string,
  version: string,
  platform: string,
  buildDir: string,
  installDir: string,
  depsDir: string,
  bucket: string,
  region: string,
): void {
  // Cleanup from previous attempt
  try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
  try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(installDir, { recursive: true })

  const args = [
    'scripts/build-package.ts',
    '--package', domain,
    '--version', version,
    '--platform', platform,
    '--build-dir', buildDir,
    '--prefix', installDir,
    '--deps-dir', depsDir,
    '--bucket', bucket,
    '--region', region,
  ]

  execSync(`bun ${args.join(' ')}`, {
    cwd: join(process.cwd()),
    env: { ...process.env },
    stdio: 'inherit',
    timeout: 60 * 60 * 1000, // 60 min per package (fbthrift/heavy C++ need >45 min)
  })
}

interface BuildResult {
  status: 'skipped' | 'uploaded' | 'failed'
  error?: string
}

async function buildAndUpload(
  pkg: BuildablePackage,
  bucket: string,
  region: string,
  platform: string,
  force: boolean,
): Promise<BuildResult> {
  const { domain, name, versions } = pkg
  let version = pkg.latestVersion

  const pkgStartTime = Date.now()
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📦 ${name} (${domain}) v${version}`)
  console.log(`${'─'.repeat(60)}`)

  // Skip versions with known fundamental toolchain incompatibilities
  if (isVersionSkipped(domain, version)) {
    console.log(`   ⚠️  Version ${version} skipped (known incompatibility)`)
    return { status: 'skipped' }
  }

  // Skip sentinel/placeholder versions
  if (version === '999.999.999' || version === '0.0.0') {
    // Try to find a real version
    const realVersions = versions.filter(v => v !== '999.999.999' && v !== '0.0.0')
    if (realVersions.length > 0) {
      version = realVersions[0]
      console.log(`   ⚠️  Skipped sentinel version, using ${version}`)
    } else {
      console.log(`   ⚠️  Only sentinel versions available, skipping`)
      return { status: 'skipped' }
    }
  }

  // Check if already in S3 (check latest real version first, then try others)
  if (!force) {
    const exists = await checkExistsInS3(domain, version, platform, bucket, region)
    if (exists) {
      console.log(`   ✓ Already in S3 for ${platform}, skipping`)
      return { status: 'skipped' }
    }
  }

  const buildDir = `/tmp/buildkit-${domain.replace(/\//g, '-')}`
  const installDir = `/tmp/buildkit-install-${domain.replace(/\//g, '-')}`
  const artifactsDir = `/tmp/buildkit-artifacts`
  const depsDir = `/tmp/buildkit-deps`

  mkdirSync(artifactsDir, { recursive: true })
  mkdirSync(depsDir, { recursive: true })

  // Build version candidates: try latest first, then fallback to previous versions
  const versionCandidates = [version]
  if (versions && versions.length > 1) {
    // Add up to 3 previous versions as fallbacks
    for (const v of versions) {
      if (v !== version && v !== '999.999.999' && v !== '0.0.0' && versionCandidates.length < 4) {
        versionCandidates.push(v)
      }
    }
  }

  let lastError: Error | null = null
  let usedVersion = version

  for (const candidateVersion of versionCandidates) {
    try {
      if (candidateVersion !== version) {
        // Check if this fallback version already in S3
        if (!force) {
          const exists = await checkExistsInS3(domain, candidateVersion, platform, bucket, region)
          if (exists) {
            console.log(`   ✓ Fallback version ${candidateVersion} already in S3, skipping`)
            return { status: 'skipped' }
          }
        }
        console.log(`   ⚠️  Trying fallback version ${candidateVersion}...`)
      }

      console.log(`   Building ${domain}@${candidateVersion} for ${platform}...`)

      tryBuildVersion(domain, candidateVersion, platform, buildDir, installDir, depsDir, bucket, region)

      usedVersion = candidateVersion
      lastError = null
      break // Build succeeded
    } catch (error: any) {
      lastError = error
      const errMsg = error.message || ''

      // Only try fallback versions if the error is a source download failure
      // Exit code 42 from build-package.ts = download failure (curl 404, git clone fail, etc.)
      const isDownloadError = error.status === 42 ||
        errMsg.includes('DOWNLOAD_FAILED') ||
        errMsg.includes('curl') ||
        errMsg.includes('404') ||
        errMsg.includes('The requested URL returned error')
      if (!isDownloadError) {
        // Not a download error — don't try other versions, this is a build error
        break
      }

      console.log(`   ⚠️  Version ${candidateVersion} source not available (exit code: ${error.status})`)
    }
  }

  if (lastError) {
    const elapsed = Math.round((Date.now() - pkgStartTime) / 1000)
    console.error(`   ❌ Failed (${elapsed}s): ${lastError.message}`)
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    return { status: 'failed', error: lastError.message }
  }

  try {
    // Create tarball
    console.log(`   Packaging...`)
    const artifactDir = join(artifactsDir, `${domain.replace(/\//g, '-')}-${usedVersion}-${platform}`)
    mkdirSync(artifactDir, { recursive: true })

    const tarball = `${domain.replace(/\//g, '-')}-${usedVersion}.tar.gz`
    execSync(`cd "${installDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
    execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

    // Upload to S3
    console.log(`   Uploading to S3...`)
    await uploadToS3Impl({
      package: domain,
      version: usedVersion,
      artifactsDir,
      bucket,
      region,
    })

    // Cleanup
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${artifactDir}"`, { stdio: 'pipe' }) } catch {}

    const elapsed = Math.round((Date.now() - pkgStartTime) / 1000)
    console.log(`   ✅ Uploaded ${domain}@${usedVersion} (${elapsed}s)`)
    return { status: 'uploaded' }
  } catch (error: any) {
    console.error(`   ❌ Failed packaging/upload: ${error.message}`)
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    return { status: 'failed', error: error.message }
  }
}

// --- Main ---

async function main() {
  const { values } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      batch: { type: 'string' },
      'batch-size': { type: 'string', default: '50' },
      platform: { type: 'string' },
      package: { type: 'string', short: 'p' },
      force: { type: 'boolean', short: 'f', default: false },
      'multi-version': { type: 'boolean', default: false },
      'max-versions': { type: 'string', default: '5' },
      'count-only': { type: 'boolean', default: false },
      list: { type: 'boolean', short: 'l', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  })

  if (values.help) {
    console.log(`
Build All Packages — Batch builder for pantry packages

Discovers all packages with distributable URLs in pantry YAML,
builds them from source, and uploads to S3.

Usage:
  bun scripts/build-all-packages.ts -b <bucket> [options]

Options:
  -b, --bucket <name>      S3 bucket (required)
  -r, --region <region>    AWS region (default: us-east-1)
  --batch <N>              Batch index (0-based)
  --batch-size <N>         Packages per batch (default: 50)
  --platform <platform>    Override platform (e.g., darwin-arm64)
  -p, --package <domains>  Comma-separated specific packages
  -f, --force              Re-upload even if exists
  --multi-version          Build multiple important versions per package
  --max-versions <N>       Max versions per package (default: 5, requires --multi-version)
  --count-only             Print total buildable count and exit
  -l, --list               List all buildable packages
  --dry-run                Show what would be built
  -h, --help               Show help
`)
    process.exit(0)
  }

  // Discover all buildable packages (pass platform for filtering)
  const { platform: detectedPlatformForDiscovery } = detectPlatform()
  const discoveryPlatform = values.platform || detectedPlatformForDiscovery
  console.log(`Discovering buildable packages for ${discoveryPlatform}...`)
  let allPackages = discoverPackages(discoveryPlatform)

  // Filter to packages with build scripts (compilable from source)
  // Skip packages that are handled by sync-packages.ts (pre-built binaries)
  const preBuiltDomains = new Set([
    'bun.sh', 'nodejs.org', 'meilisearch.com', 'redis.io',
    'postgresql.org', 'mysql.com', 'getcomposer.org', 'pnpm.io',
    'yarnpkg.com', 'go.dev', 'deno.land', 'python.org',
  ])

  allPackages = allPackages.filter(p => !preBuiltDomains.has(p.domain))

  // Filter to packages that actually have build scripts (skip metadata-only packages)
  // Skip this filter for targeted builds (-p) since the parser may miss some build scripts
  const withoutScript = values.package ? [] : allPackages.filter(p => !p.hasBuildScript)
  if (!values.package) {
    allPackages = allPackages.filter(p => p.hasBuildScript)
  }

  // Platform-aware filtering: skip packages that can't build on this platform
  const { platform: detectedPlatformEarly } = detectPlatform()
  const targetPlatform = values.platform || detectedPlatformEarly
  const targetOs = targetPlatform.split('-')[0]

  // Packages that are platform-specific (skip on wrong platform)
  const linuxOnlyDomains = new Set([
    'alsa-project.org/alsa-lib', 'alsa-project.org/alsa-plugins', 'alsa-project.org/alsa-utils',
    'elfutils.org', 'freedesktop.org/libbsd', 'kernel.org/linux-headers',
    'musl.libc.org', 'pagure.io/libaio', 'strace.io', 'systemd.io',
    'nixos.org/patchelf', // ELF binary patcher, Linux-only
    'spawn.link', 'postgrest.org', 'gitlab.com/procps-ng/procps',
    'apptainer.org', // Linux container runtime
    'apple.com/remote_cmds', // ironically Linux-buildable only in certain configs
    'freedesktop.org/slirp', // Linux-only networking library (needs Linux headers)
    'freedesktop.org/desktop-file-utils', // Linux desktop integration (glib dep chain fails on darwin)
    'freedesktop.org/icon-theme', // freedesktop icon theme, meson build fails on darwin
    'freedesktop.org/vdpau', // Video decode API, Linux-only (no VA-API on macOS)
    // gstreamer.freedesktop.org/orc — fixed: fallback to python3 -m mesonbuild on darwin
    'gnome.org/glib-networking', // GNOME networking, glib dep chain fails on darwin
    'pagure.io/xmlto', // xmlto uses BSD getopt on macOS which lacks long options support
    'freedesktop.org/dbus', // gio-unix-2.0 pkg-config chain fails on darwin (S3 pkg-config vs Homebrew glib)
    'swagger.io/swagger-codegen', // Maven/Java build, install -D flag incompatible with macOS
    'github.com/opencollab/arpack-ng', // Needs gfortran (not available on macOS CI runners)
    // apache.org/zookeeper moved to knownBrokenDomains — Maven C-client configure fails on both platforms
    'apache.org/httpd', // --with-apr-util path resolution broken on darwin
    'mupdf.com', // darwin build fails (install_name_tool fixup on mupdf-gl), linux OK
    // grpc.io moved to knownBrokenDomains — v1.78.1 also fails on linux (missing protobuf header)
    'mozilla.org/nss', // ARM64 crypto intrinsics issue on darwin, linux OK
    'crates.io/versio', // Rust linker failure on darwin (many lib deps), linux OK
    'fuellabs.github.io/sway', // Rust linker failure on darwin (forc binary), linux OK
    'gitlab.com/procps-ng/watch', // Linux process utilities, darwin build fails
    // sfcgal.org removed — added brew CGAL install override for darwin
    'browser-use.com', // Python 3.12 constraint + setuptools timeout on darwin, linux OK
    'openslide.org', // libdicom symbols generation fails on darwin (code 127), linux OK
    'getmonero.org', // cmake security-hardening test failures on darwin ARM64, linux OK
    'github.com/stub42/pytz', // zic linker failure on darwin ARM64 (symbols not found), linux OK
    'mergestat.com/mergestat-lite', // vendored zlib C23 incompatibility with Xcode 26.3, linux OK
    'practical-scheme.net/gauche', // dlopen failure + -version flag incompatibility with Xcode clang, linux OK
    'open-mpi.org', // Compilation timeout on darwin CI runners (huge C codebase), linux OK
    // gnu.org/texinfo — fixed: rewrote perl shebang fix as robust for-loop
    // gnu.org/bc — fixed: MAKEINFO=true on darwin skips info pages
    // laravel.com — fixed: symlink ICU libs from unicode.org into PHP lib dir on darwin
  ])
  const darwinOnlyDomains = new Set([
    'apple.com/container', 'tuist.io/xcbeautify', 'veracode.com/gen-ir',
    'github.com/mas-cli/mas', 'github.com/XcodesOrg/xcodes',
    'github.com/nicklockwood/SwiftFormat', 'github.com/peripheryapp/periphery',
    'github.com/unsignedapps/swift-create-xcframework',
    'github.com/XCTestHTMLReport/XCTestHTMLReport', 'github.com/yonaskolb/Mint',
    'github.com/mxcl/swift-sh', 'github.com/kiliankoe/swift-outdated',
    'github.com/a7ex/xcresultparser', 'github.com/create-dmg/create-dmg',
    'portaudio.com',
    'gnupg.org/libgcrypt', // Linux system libgpg-error too old (needs >= 1.56), builds fine on darwin
    'microsoft.com/code-cli', // OpenSSL linking issues on Linux, builds fine on darwin
    'proj.org', // S3 curl.so missing version info breaks cmake on linux, darwin OK
    'pwmt.org/zathura', // gnutls/nettle ABI mismatch breaks HTTPS git on linux, darwin OK
    'facebook.com/watchman', // glog ABI mismatch in S3 wangle/fizz on linux, darwin OK
    'glm.g-truc.net', // Header-only library, cmake/install fails on linux, works on darwin
    'graphviz.org', // fontconfig API mismatch on linux, builds fine on darwin with Homebrew deps
    'crates.io/mask', // rust-lld raw-dylibs issue on linux, builds fine on darwin
    'dns.lookup.dog', // openssl-sys build failure on linux, builds fine on darwin
    'gnu.org/texinfo', // cc_wrapper + gnulib glob expansion on linux, builds fine on darwin
    'musepack.net', // duplicate symbols on linux, builds fine on darwin
  ])

  // Packages needing specialized toolchains not available in CI
  const haskellPackages = new Set([
    'dhall-lang.org', 'pandoc.org', 'pandoc.org/crossref',
    'shellcheck.net', 'haskell.org', 'haskell.org/cabal',
  ])
  const specializedToolchainPackages = new Set([
    ...haskellPackages, // Need GHC/cabal
    'nim-lang.org', // Need Nim compiler
    'crystal-lang.org', // Need Crystal compiler
    'crystal-lang.org/shards', // Depends on crystal
    'dart.dev', // Need Dart SDK
    'vlang.io', // Need V compiler
    'rebar3.org', // Need Erlang runtime
  ])

  // Packages with known broken recipes or that fundamentally can't build in standard CI
  // Keep this list MINIMAL — fix issues rather than skip packages
  // Packages removed after fixes:
  //   pixman.org — -Werror filtering now handles clang warnings
  //   gnu.org/plotutils — -Werror filtering + recipe sed fixes handle modern compilers
  //   microbrew.org/md5sha1sum — buildkit now auto-configures OpenSSL paths
  //   oracle.com/berkeley-db — recipe fixed: removed --enable-stl, added -std=c++14
  //   strace.io — linux-only, let it try with -Werror filtering
  //   abseil.io, vim.org, facebook.com/*, pwmt.org/*, khronos.org/opencl-headers,
  //     macvim.org, github.com/facebookincubator/fizz — GitHub tag resolution now
  //     handles leading-zero normalization via API lookup (resolveGitHubTag)
  const knownBrokenDomains = new Set([
    'apache.org/subversion', // Needs APR/APR-util chain (circular dep with serf)
    'apache.org/serf', // Needs scons + apr (circular dep)
    'argoproj.github.io/cd', // yarn + Go mixed build, yarn fails in CI sandbox
    'argoproj.github.io/workflows', // Massive Go compilation (>60 min), exceeds per-package timeout
    'openai.com/codex', // 3 cargo installs take >50 min then ETIMEDOUT, never succeeds
    // docker.com/cli and docker.com/machine removed — go-md2man available as pantry dep
    'coder.com/code-server', // Node.js native module C++ compilation fragile in CI
    'cr.yp.to/daemontools', // Archaic build system
    'clisp.org', // Complex FFI compiler, platform-specific ARM fixes
    'crates.io/bpb', // upstream dep (pbp) uses removed Rust feature (rust_2018_preview, removed in 1.76)
    'crates.io/didyoumean', // Rust linker failure even with --cap-lints warn
    // crates.io/drill removed — added --cap-lints warn RUSTFLAGS override
    // crates.io/mask removed — builds on darwin
    'crates.io/pqrs', // arrow-arith/chrono trait ambiguity (quarter() method conflict)
    // crates.io/rust-kanban removed — added --cap-lints warn RUSTFLAGS override
    // crates.io/spider_cli removed — added --cap-lints warn RUSTFLAGS override
    // fabianlindfors.se/reshape removed — added --cap-lints warn RUSTFLAGS override
    // frei0r.dyne.org removed — switched to GitHub source (upstream tarball was corrupt)
    'info-zip.org/unzip', // SourceForge URL with spaces/parens, unmaintained since 2009
    // practical-scheme.net/gauche removed — distributableUrl override with underscore format
    'openinterpreter.com', // tiktoken 0.7.0 uses PyO3 incompatible with Python 3.14 (CI), dep resolver ignores version constraints
    'psycopg.org/psycopg3', // Git-based distributable pulling dev versions
    'sourceware.org/dm', // GitLab download URLs return 404
    'llm.datasette.io', // GitHub tag v0.28.0 no longer exists
    // taku910.github.io/mecab-ipadic removed — mecab now in S3
    'itstool.org', // Needs Python libxml2 bindings matching exact Python version
    'oberhumer.com/ucl', // Dead upstream domain
    'khronos.org/SPIRV-Cross', // Project archived, tags removed
    'getsynth.com', // Dead/abandoned project
    'grpc.io', // darwin: TSAN/ASAN macro errors; linux: v1.78.1 missing protobuf header + timeout
    'apache.org/zookeeper', // Maven C-client configure fails on both platforms
    'ordinals.com', // GitHub tag format mismatch (all variants return 404)
    'dhruvkb.dev/pls', // Hardcoded beta tag + cargo auth failure on git deps
    'seaweedfs.com', // All GitHub release tags return 404
    'wundergraph.com', // All GitHub release tags return 404
    'riverbankcomputing.com/sip', // Server returns empty reply on all downloads
    'alembic.sqlalchemy.org', // Version tags return 404 on PyPI/GitHub
    'render.com', // Needs deno compile (no distributable source)
    'tea.xyz', // Needs deno task compile (no distributable source)
    'sdkman.io', // Shell script distribution, not compilable
    'spacetimedb.com', // Hardcoded beta tag, no version discovery
    'ntp.org', // Complex version format embedded in path (ntp-4.2.8p17)
    'jbig2dec.com', // Single hardcoded version, buried in ghostpdl releases
    'videolan.org/x264', // Version includes git hash, Debian mirror URL
    'github.com/mamba-org/mamba', // Hardcoded version, FIXME in recipe
    'github.com/confluentinc/libserdes', // RC version format in tag
    'github.com/siderolabs/conform', // Alpha version format in tag
    'github.com/MaestroError/heif-converter-image', // No proper releases (hardcoded 0.2)
    'microsoft.com/markitdown', // Version tags don't exist on GitHub
    'snyk.io', // Binary distribution, no compilable source
    'github.com/nicholasgasior/gw', // Dead project, no GitHub releases
    'foundry-rs.github.io', // All download tags return 404 (project restructured)
    'wez.github.io/wezterm', // Source tarball download fails

    'jetporch.com', // Dead project, GitHub repo/tags removed
    'libsdl.org/SDL_image', // SDL3 version resolved but URL uses SDL2_image naming
    'gource.io', // GitHub releases removed/restructured
    'xpra.org', // Wrong strip regex (/^xpra /) + massive Linux-only dep chain
    'qt.io', // Hardcoded single version 5.15.10, massive build
    // hdfgroup.org/HDF5 removed — fixed distributable URL for all version tag formats
    'pipenv.pypa.io', // Version 3000.0.0 tag doesn't exist on GitHub
    'riverbankcomputing.com/pyqt-builder', // Server returns empty reply
    'tcl-lang.org/expect', // SourceForge CDN unreliable (cytranet.dl.sourceforge.net)
    'surrealdb.com', // Old release tags removed from GitHub
    // nasm.us removed — switched version discovery to GitHub releases
    // crates.io/skim removed — added --cap-lints warn RUSTFLAGS override
    // crates.io/tabiew removed — 45min timeout should be sufficient
    'apple.com/container', // Massive Swift compilation (571+ files), fragile in CI
    'strace.io', // strace 6.2.0 incompatible with newer kernel headers (io_uring.c resv2 member removed)
    // gnu.org/source-highlight removed — added -std=c++14 to CXXFLAGS
    'microbrew.org/md5sha1sum', // Server dead — microbrew.org times out on port 80, source tarball unavailable
    'ghostgum.com.au/epstool', // Source tarball removed from ftp.debian.org (404)
    'ghostscript.com', // Tag format gs10060 for version 10.06.0 — zero-padded minor not reconstructible from semver
    // amber-lang.com removed — distributableUrl override appends -alpha suffix
    // heasarc.gsfc.nasa.gov/cfitsio removed — built successfully on both platforms
    // brxken128.github.io/dexios removed — added --cap-lints warn RUSTFLAGS override
    'clog-tool.github.io', // Uses unmaintained rustc-serialize crate, incompatible with modern Rust
    'apache.org/jmeter', // Vendored Java dist: wget in build script + complex plugin manager download
    'kornel.ski/dssim', // Requires Rust nightly (-Zunstable-options), corrupts shared rustup — needs isolated RUSTUP_HOME
    // khanacademy.org/genqlient removed — added go get x/tools@latest before build
    'beyondgrep.com', // Download URL returns 404 (ack-v3.9.0 not available)
    // elixir-lang.org removed — builds successfully on both platforms
    // elixir-lang.org/otp-27 removed — builds successfully on both platforms
    // pimalaya.org/himalaya removed — removed pinned rust-toolchain.toml, using stable Rust
    'plakar.io', // cockroachdb/swiss requires Go runtime internals not in Go 1.26
    'ipfscluster.io', // Same cockroachdb/swiss Go runtime internals issue
    // syncthing.net removed — patched compat.yaml to add Go 1.26 runtime entry
    'projectdiscovery.io/nuclei', // bytedance/sonic requires newer Go runtime internals
    'iroh.computer', // curve25519-dalek pre-release incompatible with digest crate
    // crates.io/mdcat removed — added --cap-lints warn RUSTFLAGS
    // dns.lookup.dog removed — builds on darwin
    // microsoft.com/code-cli removed — built successfully on darwin
    'fluentci.io', // Uses deno compile, fragile in CI
    // fna-xna.github.io removed — SDL2 dev packages now in CI
    // getclipboard.app removed — added include path fix override
    // perl.org removed — fixed poll.h include and removed llvm.org dep
    // priver.dev/geni removed — built successfully on both platforms
    // schollz.com/croc removed — built successfully on both platforms
    'foundry-rs.github.io/foundry', // All old version tags pruned from repo
    // volta.sh removed — removed pinned rust-toolchain.toml, unpinned yanked zip crate
    // libtom.net/math removed — libtool already in CI
    // sourceforge.net/xmlstar removed — libxml2 headers available via system
    // mypy-lang.org removed — widened python version constraint in override
    // pcre.org removed — URL override to use GitHub releases instead of SourceForge
    // digitalocean.com/doctl removed — built successfully on both platforms
    'pkl-lang.org', // Gradle buildSrc dependency resolution failure in CI
    'qemu.org', // dtc git subproject fetch fails on linux, many missing headers on darwin
    'freedesktop.org/poppler-qt5', // S3 curl.so missing version info breaks cmake on both platforms
    'apache.org/arrow', // Massive C++ build, timeout/failure on both platforms
    'gdal.org', // patchelf post-build fixup fails on linux, cmake issues on darwin
    'quickwit.io', // Private git dep (pulsar-rs) requires authentication, can't build in CI
    'raccoin.org', // Linker OOM — huge Slint UI generated code exceeds CI runner memory
    'replibyte.com', // Locked wasm-bindgen v0.2.80 incompatible with current Rust (needs >= 0.2.88)
    'wezfurlong.org/wezterm', // OS error 35 (EAGAIN) — OOM during parallel Rust compilation
    // x.org/libSM removed — already has clean ARGS (no $SHELF), ice/sm fixed
    // x.org/xmu removed — fixed $SHELF variable references in script
    // x.org/xt removed — fixed $SHELF variable references in script
    // swagger.io/swagger-codegen removed — built successfully on linux
    'angular.dev', // npm build failure on both platforms (native module compilation)
    // capnproto.org removed — already has clean cmake prefix, existing override entry covers it
    // cmake.org removed — reduced parallel jobs to prevent race condition
    // sourceforge.net/libtirpc — shared lib linking, needs kerberos.org in S3
    // werf.io removed — removed btrfs-progs/gcc/binutils deps + fixed static tags in override
    // agwa.name/git-crypt removed — xsltproc now in CI
    // gnu.org/texinfo removed — built successfully on linux
    // gstreamer.freedesktop.org/orc removed — built successfully on linux
    // laravel.com removed — built successfully on linux
    // libimobiledevice.org/libimobiledevice-glue removed — added glibtool fix
    // libsdl.org/SDL_ttf removed — sdl2 now in macOS brew
    // freedesktop.org/icon-theme removed — built successfully on linux
    // freedesktop.org/xcb-util-image removed — fixed prefix quoting in override
    // xkbcommon.org removed — removed XKeyboardConfig dep, fixed meson args
    // amp.rs removed — fixed sed portability in override
    // apache.org/apr-util removed — fixed --with-apr path quoting in override
    'crates.io/gitweb', // Crate permanently deleted from crates.io (404)
    // deepwisdom.ai removed — built successfully on darwin
    // developers.yubico.com/libfido2 removed — removed systemd.io dep override
    // docbook.org/xsl removed — fixed strip-components to 0
    // eksctl.io removed — simplified build to direct go build
    // gnu.org/bc removed — fixed URL to zero-pad minor version
    // libimobiledevice.org/libusbmuxd removed — fixed sed -i BSD
    // freedesktop.org/desktop-file-utils removed — built successfully on darwin
    // harlequin.sh removed — fixed pip install command syntax
    // libsdl.org/SDL_mixer removed — sdl2 now in macOS brew
    // lloyd.github.io/yajl removed — doxygen now in CI
    // musepack.net removed — subpackages build successfully, main package needs investigation
    // pagure.io/xmlto removed — xsltproc/docbook now in CI
    // python.org/typing_extensions removed — switched from flit to pip install
    'radicle.org', // old wasm-bindgen incompatible with current Rust (needs >= 0.2.88)
    // rclone.org removed — removed stale darwin patch and cmount tag
    // snaplet.dev/cli removed — added --legacy-peer-deps override
    // tsl0922.github.io/ttyd removed — added compiler flags override
    // videolan.org/x265 removed — built successfully on linux
    // x.org/ice removed — fixed $SHELF variable references in ARGS
    // x.org/sm removed — fixed $SHELF variable references in script
    // x.org/xkbfile removed — fixed meson invocation
    // freedesktop.org/slirp removed — built successfully on linux
    // gnome.org/libxml2 removed — fixed sed -i BSD + removed --with-python
    'postgrest.org', // Haskell build — GHC/Stack not available
    // ceph.com/cephadm removed — fixed sed -i BSD in shebang step
    // gnupg.org/libgcrypt removed — built successfully on darwin
    // libimobiledevice.org removed — fixed sed -i BSD + glibtool fix
    // libimobiledevice.org/libtatsu removed — removed libpsl dep + glibtool fix
    // matio.sourceforge.io removed — disabled HDF5 dep, build without HDF5
    // mozilla.org/nss removed — fixed sed -i BSD + removed llvm.org dep
    // nx.dev removed — added --legacy-peer-deps override
    // openpmix.github.io removed — removed --with-sge arg
    // ccache.dev removed — CMake build, all deps available
    // crates.io/gitui removed — built successfully on darwin
    // crates.io/zellij removed — added --cap-lints warn RUSTFLAGS override
    // chiark.greenend.org.uk/puzzles removed — removed halibut/llvm/imagemagick deps
    // zlib.net/minizip removed — small cmake build, deps available
    // code.videolan.org/aribb24 removed — small autotools library
    // vapoursynth.com — needs zimg in S3, build zimg first then vapoursynth
    // facebook.com/wangle removed — removed linux gcc/libstdcxx deps in override
    // unidata.ucar.edu/netcdf removed — fixed sed -i BSD in cmake fixup steps
    // x.org/libcvt removed — fixed meson invocation
    // x.org/xaw removed — fixed $SHELF variable references in script
    // sfcgal.gitlab.io removed — no such package (sfcgal.org already fixed)
    'libcxx.llvm.org', // LLVM compilation too resource-intensive for CI
    // --- Failures from run 22169381361 batches 12-18 ---
    // apache.org/arrow removed — fixed cmake prefix + sed -i BSD + removed llvm dep in override
    // apache.org/httpd removed — fixed sed -i BSD compat in override
    // apache.org/thrift removed — fixed duplicate --prefix arg in override
    // apache.org/zookeeper removed — removed cppunit/gcc deps in override
    // aws.amazon.com/cli removed — widened python version constraint in override
    // bitcoin.org removed — removed capnproto/gcc deps in override
    'bittensor.com', // Heavy Rust/Python build, fails on both platforms
    'crates.io/kaspa-miner', // Rust compilation failure
    'crates.io/lighthouse', // Heavy Rust build (Ethereum client)
    // crates.io/qsv removed — built successfully on linux
    // debian.org/iso-codes removed — fixed prefix quoting in override
    // doxygen.nl removed — removed llvm.org dep override
    // ebassi.github.io/graphene removed — disabled gobject-introspection in override
    // epsilon-project.sourceforge.io removed — simple autotools, added override entry
    // facebook.com/edencommon removed — fixed sed -i BSD + removed gcc dep in override
    // facebook.com/fb303 removed — fixed stray cmake prefix + removed gcc dep in override
    // facebook.com/fbthrift removed — fixed cmake prefix + sed -i BSD + removed gcc dep in override
    // facebook.com/mvfst removed — fixed cmake prefix + sed -i BSD + removed gcc/binutils deps in override
    // facebook.com/watchman removed — fixed cmake prefix + sed -i BSD + removed gcc dep in override
    // ferzkopp.net/SDL2_gfx removed — sdl2 now in macOS brew
    // ffmpeg.org removed — disabled SDL2 dep in override
    // fluxcd.io/flux2 removed — removed kustomize dep in override
    // freedesktop.org/appstream removed — disabled heavy deps + fixed sed -i BSD in override
    'freedesktop.org/mesa-glu', // Build failure on darwin (OpenGL dep)
    // freedesktop.org/p11-kit removed — fixed trust-paths template in override
    // freedesktop.org/polkit removed — disabled introspection + fixed prefix in override
    // freedesktop.org/poppler-qt5 removed — fixed cmake prefix + disabled qt5/introspection in override
    // freedesktop.org/shared-mime-info removed — fixed meson prefix quoting in override
    // freedesktop.org/vdpau removed — built successfully on linux
    // freedesktop.org/XKeyboardConfig removed — fixed prefix quoting + removed libxslt dep in override
    'freeglut.sourceforge.io', // Build failure on darwin (OpenGL dep)
    // gdal.org removed — fixed cmake prefix quote + sed -i BSD + removed llvm dep in override
    // geoff.greer.fm/ag — needs pcre.org in S3, build pcre.org first
    // getmonero.org removed — removed linux llvm dep in override
    // gnome.org/atk removed — disabled gobject-introspection in override
    // gnome.org/gdk-pixbuf removed — removed shared-mime-info + disabled introspection
    // gnome.org/glib removed — disabled introspection, fixed sed -i BSD
    // gnome.org/glib-networking moved to linuxOnlyDomains — builds on linux
    // gnome.org/gobject-introspection removed — fixed sed -i BSD + CC in override
    // gnome.org/gsettings-desktop-schemas removed — disabled introspection in override
    // gnome.org/gtk-mac-integration-gtk3 removed — disabled introspection + removed intltool dep in override
    // gnome.org/json-glib removed — fixed sed -i BSD + disabled introspection
    // gnome.org/librsvg removed — disabled introspection + rustup stable in override
    // gnome.org/libsecret removed — removed heavy build deps in override
    // gnome.org/pango removed — disabled introspection in override
    // gnome.org/PyGObject removed — fixed prefix quoting in override
    // gnu.org/groff removed — standard GNU build, should work with CI tools
    // gnu.org/guile removed — fixed sed -i BSD compat in override
    // gnuplot.info removed — removed libavif dep in override
    // gnutls.org removed — removed p11-kit dep + fixed sed -i BSD in override
    // grpc.io removed — fixed cmake prefix quoting in override
    // gtk.org/gtk3 removed — disabled introspection + removed x11/heavy deps in override
    // gtk.org/gtk4 removed — disabled introspection + removed heavy build deps in override
    'hasura.io', // Build failure on darwin
    // ibr.cs.tu-bs.de/libsmi removed — fixed prefix quoting in override
    // intel.com/libva removed — removed x.org/x11 dep chain + disabled x11 in override
    // jpeg.org/jpegxl removed — disabled openexr in override
    // kubebuilder.io removed — removed goreleaser dep in override
    // kubernetes.io/kubectl removed — removed rsync dep in override
    // lavinmq.com removed — fixed sed -i BSD compat in override
    // leonerd.org.uk/libtermkey removed — small C library, try on darwin
    // libarchive.org removed — autotools issue may be fixed with newer CI runner
    'llvm.org', // LLVM — too resource-intensive for CI (3500+ files)
    'llvm.org/clang-format', // LLVM subset — still too heavy
    // luarocks.org removed — lua already in CI brew list
    'lunarvim.org', // Build failure (dep chain)
    'macfuse.github.io/v2', // macOS FUSE — build timeout (1800s)
    // macvim.org removed — removed perl/ruby/tcl interp deps in override
    'materialize.com', // Heavy Rust database build
    // mergestat.com/mergestat-lite removed — removed python build dep in override
    'mesa3d.org', // Mesa 3D — massive build with many deps
    // midnight-commander.org removed — ncurses/glib available via system
    // modal.com removed — removed cython dep in override
    // mpv.io removed — removed vapoursynth dep in override
    'mun-lang.org', // Build failure on darwin
    // mupdf.com removed — fixed sed -i BSD + removed linux X11/mesa deps in override
    // netflix.com/vmaf removed — fixed meson prefix quoting in override
    // open-mpi.org removed — fixed prefix quoting + sed -i BSD in override
    // opendap.org removed — removed linux libtirpc/util-linux deps in override
    // openresty.org removed — fixed sed -i BSD compat in override
    // opensearch.org removed — fixed sed -i BSD compat in override
    // openslide.org removed — meson now uses wrap-mode=default to download libdicom subproject
    // openssh.com removed — standard autotools, OpenSSL available
    // orhun.dev/gpg-tui removed — added --cap-lints warn RUSTFLAGS override
    // php.net removed — fixed sed -i BSD + removed kerberos dep in override
    // poppler.freedesktop.org removed — disabled gobject-introspection in override
    // proj.org removed — fixed sha256sum darwin compat in override
    // projen.io removed — removed maven dep in override
    // pulumi.io removed — fixed sed -i BSD compat in override
    // pwmt.org/girara removed — gtk3/json-glib now fixed in override
    // pwmt.org/zathura removed — fixed sed -i BSD + removed adwaita dep in override
    // python-pillow.org removed — removed x.org/xcb dep in override
    // qemu.org removed — fixed prefix quoting + sed -i BSD + removed vde dep in override
    // qpdf.sourceforge.io removed — removed gnutls dep in override
    // rockdaboot.github.io/libpsl removed — switched to libidn2 runtime
    // rucio.cern.ch/rucio-client removed — removed postgresql dep in override
    'rust-lang.org', // Rust compiler — too massive for CI
    // sass-lang.com/libsass removed — built successfully on darwin
    // sass-lang.com/sassc — needs libsass in S3, build libsass first then sassc
    // sfcgal.org removed — fixed stray cmake prefix quote in override
    'solana.com', // Heavy Rust blockchain build
    // sourceforge.net/faac removed — fixed prefix quoting + removed gcc dep in override
    // tcl-lang.org removed — removed x.org/x11 dep + fixed sed -i BSD in override
    'tectonic-typesetting.github.io', // TeX engine — heavy Rust build
    // tesseract-ocr.github.io removed — fixed prefix quoting in override
    'tinygo.org', // TinyGo — heavy LLVM-based build
    // tlr.dev removed — removed protobuf dep in override
    'vaultproject.io', // HashiCorp Vault — Go build failure
    // videolan.org/libplacebo removed — removed linux gcc dep in override
    // vim.org removed — removed perl/ruby interp deps in override
    // virtualsquare.org/vde removed — fixed prefix quoting in override
    // wireshark.org removed — fixed cmake prefix + removed libsmi dep in override
    // x.org/libxfont2 removed — simple autotools, added override entry
    // x.org/x11 removed — fixed prefix quoting in override
    // x.org/xauth removed — fixed prefix quoting + removed gcc dep in override
    // x.org/xinput removed — fixed prefix quoting in override
    // xkbcommon.org removed — removed XKeyboardConfig dep, fixed meson args (see above)
    // bytebase.com and dozzle.dev removed — 60min timeout should be sufficient
    // freedesktop.org/dbus removed — removed xmlto dep, disabled docs
    // gnu.org/gmp removed — URL override to use ftpmirror.gnu.org
    // leonerd.org.uk/libvterm removed — small C library, try build script fix
    // libsoup.org removed — fixed prefix quoting + disabled introspection/vala in override
    'systemd.io', // Complex linux init system — build failure
    'getfoundry.sh', // GitHub tags deleted from foundry-rs/foundry repo (old versions pruned)
    // deepwisdom.ai removed — patched out faiss_cpu on linux
    // expo.dev/eas-cli removed — added corepack yarn 4 activation
    // geoff.greer.fm/ag — added earlier in this list
    // musepack.net removed — fixed stray cmake prefix quote in override
    // wpewebkit.org/wpebackend-fdo removed — fixed prefix quoting + sed -i BSD + removed gcc/mesa deps in override
    'bytebase.com', // Massive Go+pnpm build, exceeds CI timeout (ETIMEDOUT)
    // github.com/antfu/ni removed — fixed pnpm self-install globally in buildkit.ts (npm_config_manage_package_manager_versions=false)
    // crates.io/qsv removed — removed linux wayland dep in override
    // luarocks.org removed — fixed prefix quoting + sed -i BSD + removed info-zip dep in override
    'github.com/safe-waters/docker-lock', // Repository deleted (404)
    'github.com/aristocratos/btop', // Needs GCC 14+ for C++23 std::ranges::to (CI has GCC 13)
    'github.com/snowplow/factotum', // Ancient traitobject crate incompatible with modern Rust
    'github.com/withered-magic/starpls', // Bazel build fails in CI
    'github.com/hadolint/hadolint', // Haskell/Cabal build — GHC/Stack not available in CI
    'github.com/mas-cli/mas', // Swift build: duplicate .build targets on CI runner
    'github.com/unsignedapps/swift-create-xcframework', // posix_spawn conflict in swift-llbuild
    // github.com/nvbn/thefuck removed — widened python version constraint in override
    'github.com/npiv/chatblade', // tiktoken requires Rust pyo3-ffi compilation that fails on Python 3.14
    // github.com/stub42/pytz removed — widened python version constraint in override
    // github.com/mattrobenolt/jinja2-cli removed — widened python version constraint in override
    // github.com/pressly/sup removed — fixed go mod init in override
    // github.com/moretension/duti removed — fixed make install in override
    'github.com/a7ex/xcresultparser', // ncurses unctrl.h conflict on darwin
    'github.com/peripheryapp/periphery', // Swift ncurses unctrl.h conflict on darwin
    'github.com/coqui-ai/TTS', // Requires Python <3.11 — CI has 3.14, heavy ML deps
    'github.com/VikParuchuri/surya', // Requires Python ~3.11 with pytorch, incompatible with 3.14
    'github.com/awslabs/llrt', // Requires Rust nightly + Zig toolchain, not in standard CI
    'github.com/glauth/glauth', // PAM plugin API mismatch — needs upstream code fix
    'github.com/shaka-project/shaka-packager', // Complex git submodule + ninja build failures
    'github.com/libkml/libkml', // minizip ints.h header not found + Boost compat issues
    'gaia-gis.it/libspatialite', // Blocked on proj.org dependency chain
    'github.com/OSGeo/libgeotiff', // Blocked on proj.org dependency chain
    // github.com/allure-framework/allure2 removed — fixed strip-components in override
    'man-db.gitlab.io/man-db', // Dependency chain failure (libpipeline, groff)
    'aws.amazon.com/sam', // pip install requires Python <3.14 (upstream constraint)
    'github.com/Diniboy1123/usque', // gvisor Go 1.26 build-tag redeclaration conflict
    // github.com/essembeh/gnome-extensions-cli removed — widened python version in override
    // github.com/sindresorhus/macos-term-size removed — fixed build script for renamed binary + skip codesign
    'eyrie.org/eagle/podlators', // Version 5.1.0 doesn't exist on archives.eyrie.org (only v6.0.2 available)
    // github.com/thkukuk/libnsl removed — added system libtirpc-dev install + linux-only supportedPlatforms
    // --- Failures from sync run 22422991817 ---
    // github.com/p7zip-project/p7zip removed — fixed version tag format in override
    // github.com/google/re2 removed — fixed date-based version tag in override
    'github.com/saagarjha/unxip', // Download 404 — pre-built binary URL returns 404
    // videolan.org/x265 removed — patched CMakeLists.txt to use CMP0025/CMP0054 NEW policy
    'snaplet.dev/cli', // better-sqlite3 node-gyp fails with Node 24 (modifyRecipe can't override S3 dep)
    // ceph.com/cephadm removed — replaced sed shebang patching with python3 -m zipapp
    // opensearch.org removed — openjdk.org override now downloads pre-built Temurin JDK
    'pulumi.io', // Needs `uv` package manager + Go module directory issue
    // nx.dev removed — successfully built and uploaded
    // gnu.org/texinfo removed — builds on darwin, linux gnulib issue is tolerable
    'gnu.org/guile', // cc wrapper + libtool interaction: scmconfig.h not generated
    'sourceforge.net/libtirpc', // Shared library libtirpc.so.3.0.0 not produced despite --enable-shared
    'sourceforge.net/xmlstar', // libxml2 2.15 API changes too extensive (callback sig rewrite needed)
    // werf.io removed — added exclude_graphdriver_btrfs build tag in override
    'github.com/aws/aws-sdk-cpp', // cmake target_link_libraries error with AWS::crypto
    'projen.io', // npm pack ERR_OUT_OF_RANGE during jsii-pacmak Python packaging
    'opendap.org', // configure XDR size detection fails even with cache vars
    'aws.amazon.com/cli', // flit_core uses ast.Str removed in Python 3.12, S3 only has Python 3.14
    'deepwisdom.ai', // metagpt requires Python <3.12, S3 only has Python 3.12+/3.14
    'lunarvim.org', // Installer can't find neovim binary despite dep — PATH issue
    'modal.com', // grpcio-tools 1.59.2 fails to compile with current Python/compilers
    'rucio.cern.ch/rucio-client', // Python build module chain failure — empty pip install
    // mypy-lang.org removed — pinned pathspec<0.12 in override (0.12+ removed GitWildMatchPatternError)
    'tcl-lang.org', // System Tcl 8.x version conflict with newly built Tcl 9
    // github.com/luvit/luv removed — fixed stray cmake prefix quote + LUA_INSTALL_DIR override
    // musepack.net removed — added --allow-multiple-definition to cmake linker flags
    'tcl-lang.org/expect', // SourceForge download mirror unreachable
    // --- Failures from verification builds (2026-02-26) ---
    // poppler.freedesktop.org removed — disabled NSS3/GPGME deps, removed gpgme/nss from deps in override
    'freedesktop.org/appstream', // meson build fails — complex dep chain (libfyaml, systemd, etc)
    'unidata.ucar.edu/netcdf', // cmake build fails even with HDF5 disabled
    'lavinmq.com', // Crystal/shards toolchain not available in CI
    'vapoursynth.com', // Needs zimg (not in S3 dep chain)
    'github.com/kdave/btrfs-progs', // Needs kernel headers + e2fsprogs (complex Linux-only)
    // imagemagick.org removed — fixed version tag format + removed broken deps in override
  ])

  let platformSkipped = 0
  let toolchainSkipped = 0
  let propsSkipped = 0
  let knownBrokenSkipped = 0

  // When -p is specified, only skip platform-incompatible packages (can't build linux on darwin)
  // All other filters (knownBroken, toolchain, props) are bypassed for targeted builds
  const isTargetedBuild = !!values.package

  allPackages = allPackages.filter(p => {
    // Platform filtering (always applies — can't cross-compile)
    if (targetOs === 'darwin' && linuxOnlyDomains.has(p.domain)) {
      platformSkipped++
      return false
    }
    if (targetOs === 'linux' && darwinOnlyDomains.has(p.domain)) {
      platformSkipped++
      return false
    }
    // Skip remaining filters for targeted builds
    if (isTargetedBuild) return true
    // Toolchain filtering
    if (specializedToolchainPackages.has(p.domain)) {
      toolchainSkipped++
      return false
    }
    // Known broken recipes
    if (knownBrokenDomains.has(p.domain)) {
      knownBrokenSkipped++
      return false
    }
    // Missing props filtering (props/ referenced but directory doesn't exist)
    if (p.needsProps && !p.hasProps) {
      propsSkipped++
      return false
    }
    return true
  })

  console.log(`Found ${allPackages.length} buildable packages (excluding ${preBuiltDomains.size} pre-built, ${withoutScript.length} without build scripts, ${platformSkipped} wrong platform, ${toolchainSkipped} missing toolchain, ${knownBrokenSkipped} known broken, ${propsSkipped} missing props)`)

  if (values['count-only']) {
    console.log(allPackages.length)
    process.exit(0)
  }

  if (values.list) {
    console.log('\nBuildable packages:')
    for (const pkg of allPackages) {
      console.log(`  ${pkg.domain} (${pkg.name}) v${pkg.latestVersion} ${pkg.hasBuildScript ? '[has build script]' : '[no build script]'}`)
    }
    console.log(`\nTotal: ${allPackages.length}`)
    process.exit(0)
  }

  if (!values.bucket) {
    console.error('Error: --bucket is required')
    process.exit(1)
  }

  const bucket = values.bucket
  const region = values.region || 'us-east-1'
  const { platform: detectedPlatform } = detectPlatform()
  const platform = values.platform || detectedPlatform
  const batchSize = parseInt(values['batch-size'] || '50', 10)
  const force = values.force || false
  const multiVersion = values['multi-version'] || false
  const maxVersions = parseInt(values['max-versions'] || '5', 10)

  // Filter by specific packages if provided
  if (values.package) {
    const domains = values.package.split(',').map(d => d.trim())
    allPackages = allPackages.filter(p =>
      domains.some(d => p.domain === d || p.domain.includes(d) || p.name === d)
    )
  }

  // Apply batch slicing
  let packagesToBuild = allPackages
  if (values.batch !== undefined) {
    const batchIndex = parseInt(values.batch, 10)
    const start = batchIndex * batchSize
    const end = start + batchSize
    packagesToBuild = allPackages.slice(start, end)
    console.log(`Batch ${batchIndex}: packages ${start}-${Math.min(end, allPackages.length) - 1} of ${allPackages.length}`)
  }

  if (packagesToBuild.length === 0) {
    console.log('No packages to build in this batch')
    process.exit(0)
  }

  console.log(`\n🚀 Building ${packagesToBuild.length} packages for ${platform}`)
  console.log(`   Bucket: ${bucket}`)
  console.log(`   Region: ${region}`)
  console.log(`   Force: ${force}`)
  if (multiVersion) {
    console.log(`   Multi-version: up to ${maxVersions} versions per package`)
  }

  if (values['dry-run']) {
    console.log('\n[DRY RUN] Would build:')
    for (const pkg of packagesToBuild) {
      if (multiVersion) {
        const versions = selectImportantVersions(pkg, maxVersions)
        console.log(`  - ${pkg.domain}:`)
        for (const v of versions) {
          const exists = await checkExistsInS3(pkg.domain, v, platform, bucket, region)
          console.log(`      @${v} ${exists ? '(already in S3)' : '(would build)'}`)
        }
      } else {
        const exists = await checkExistsInS3(pkg.domain, pkg.latestVersion, platform, bucket, region)
        console.log(`  - ${pkg.domain}@${pkg.latestVersion} ${exists ? '(already in S3)' : '(would build)'}`)
      }
    }
    process.exit(0)
  }

  // Build each package
  const results: Record<string, BuildResult & { version: string }> = {}
  const batchStartTime = Date.now()
  const BATCH_TIME_BUDGET_MS = 100 * 60 * 1000 // 100 min — leave 10 min buffer before 110 min step timeout

  for (const pkg of packagesToBuild) {
    const elapsed = Date.now() - batchStartTime
    if (elapsed > BATCH_TIME_BUDGET_MS) {
      const remaining = packagesToBuild.length - Object.keys(results).length
      console.log(`\n⏱️  Batch time budget exceeded (${Math.round(elapsed / 60000)} min elapsed). Skipping remaining ${remaining} packages.`)
      break
    }

    if (multiVersion) {
      // Multi-version mode: build multiple important versions per package
      const versions = selectImportantVersions(pkg, maxVersions)
      console.log(`\n📦 ${pkg.domain}: building ${versions.length} versions [${versions.join(', ')}]`)

      for (const ver of versions) {
        const elapsed2 = Date.now() - batchStartTime
        if (elapsed2 > BATCH_TIME_BUDGET_MS) break

        // Create a modified package with this specific version as target
        const versionPkg = { ...pkg, latestVersion: ver }
        const result = await buildAndUpload(versionPkg, bucket, region, platform, force)
        const key = `${pkg.domain}@${ver}`
        results[key] = { ...result, version: ver }
      }
    } else {
      const result = await buildAndUpload(pkg, bucket, region, platform, force)
      results[pkg.domain] = { ...result, version: pkg.latestVersion }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Build Summary')
  console.log('═'.repeat(60))

  const uploaded = Object.entries(results).filter(([_, r]) => r.status === 'uploaded')
  const skipped = Object.entries(results).filter(([_, r]) => r.status === 'skipped')
  const failed = Object.entries(results).filter(([_, r]) => r.status === 'failed')

  // In multi-version mode, the key already includes @version
  const formatEntry = multiVersion
    ? ([key, _r]: [string, BuildResult & { version: string }]) => key
    : ([domain, r]: [string, BuildResult & { version: string }]) => `${domain}@${r.version}`

  if (uploaded.length > 0) {
    console.log(`\nBuilt & Uploaded (${uploaded.length}):`)
    uploaded.forEach(e => console.log(`   - ${formatEntry(e)}`))
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped — already in S3 (${skipped.length}):`)
    skipped.forEach(e => console.log(`   - ${formatEntry(e)}`))
  }

  if (failed.length > 0) {
    console.log(`\nFailed (${failed.length}):`)
    failed.forEach(e => console.log(`   - ${formatEntry(e)}: ${e[1].error}`))
  }

  const attempted = uploaded.length + failed.length
  console.log(`\nTotal: ${uploaded.length} uploaded, ${skipped.length} skipped, ${failed.length} failed`)

  // Write GitHub Actions Job Summary so failures are visible on the run page
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    const lines: string[] = []
    lines.push(`## Build Summary`)
    lines.push('')
    lines.push(`| Metric | Count |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Uploaded | ${uploaded.length} |`)
    lines.push(`| Skipped (already in S3) | ${skipped.length} |`)
    lines.push(`| Failed | ${failed.length} |`)
    lines.push('')

    if (failed.length > 0) {
      lines.push(`### Failed Packages`)
      lines.push('')
      lines.push(`| Package | Error |`)
      lines.push(`|---------|-------|`)
      for (const entry of failed) {
        const error = (entry[1].error || 'unknown').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200)
        lines.push(`| ${formatEntry(entry)} | ${error} |`)
      }
      lines.push('')
    }

    if (uploaded.length > 0) {
      lines.push(`<details><summary>Uploaded Packages (${uploaded.length})</summary>`)
      lines.push('')
      for (const entry of uploaded) {
        lines.push(`- ${formatEntry(entry)}`)
      }
      lines.push('')
      lines.push(`</details>`)
    }

    try {
      appendFileSync(summaryPath, lines.join('\n'))
    }
    catch (e) {
      console.warn('Could not write job summary:', e)
    }
  }

  if (failed.length > 0) {
    const failRate = attempted > 0 ? (failed.length / attempted * 100).toFixed(0) : 0
    console.log(`\nFailure rate: ${failRate}% (${failed.length}/${attempted} attempted)`)

    // For targeted builds (-p flag), exit non-zero so CI reports the failure
    // For batch builds, exit 0 — individual failures are expected and the
    // batch ran to completion; successfully built packages are in S3
    if (isTargetedBuild) {
      console.log(`\nTargeted build had failures — exiting with error`)
      process.exit(1)
    }

    console.log(`Note: Individual build failures are expected for packages with complex`)
    console.log(`dependencies or platform-specific requirements. Successfully built`)
    console.log(`packages have been uploaded to S3.`)
  }
}

main().catch((error) => {
  console.error('Build all packages failed:', error.message)
  process.exit(1)
})
