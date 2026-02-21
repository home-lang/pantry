/**
 * Package Recipe Overrides — Durable fixes that survive upstream YAML syncs
 *
 * All package.yml files in src/pantry/ are synced from pkgx upstream every 20 minutes
 * via update-pantry.yml. This means any direct fixes to package.yml files get overwritten.
 *
 * This file defines build-time overrides that are applied AFTER YAML parsing but BEFORE
 * build script generation (in applyRecipeOverrides). They fix platform-specific issues,
 * broken upstream URLs, and toolchain incompatibilities without touching YAML files.
 *
 * GENERIC FIXES (in applyRecipeOverrides, not here):
 *   - ftp.gnu.org → ftpmirror.gnu.org in distributable URLs (~48 GNU packages)
 *   - Fix stray quote in -DCMAKE_INSTALL_PREFIX="{{prefix}} (musepack, yajl, etc.)
 *
 * To add a new override:
 *   1. Add an entry to packageOverrides keyed by package domain
 *   2. Use the declarative fields (env, prependScript, distributableUrl) when possible
 *   3. Use modifyRecipe only for complex mutations that can't be expressed declaratively
 */

export type ScriptStep = string | { run: string; 'working-directory'?: string; if?: string }

export interface PackageOverride {
  distributableUrl?: string
  stripComponents?: number
  prependScript?: ScriptStep[]
  env?: Record<string, string | string[]>
  platforms?: {
    linux?: Omit<PackageOverride, 'platforms' | 'modifyRecipe'>
    darwin?: Omit<PackageOverride, 'platforms' | 'modifyRecipe'>
  }
  modifyRecipe?: (recipe: any) => void
}

// ── Shared script patterns ─────────────────────────────────────────────

/** macOS glibtool PATH fix — Makefiles expect 'glibtool' from Homebrew's keg-only libtool */
const GLIBTOOL_FIX: ScriptStep = {
  run: [
    'if ! command -v glibtool &>/dev/null; then',
    '  BREW_LIBTOOL="$(brew --prefix libtool 2>/dev/null)/bin"',
    '  if [ -f "$BREW_LIBTOOL/glibtool" ]; then',
    '    export PATH="$BREW_LIBTOOL:$PATH"',
    '  fi',
    'fi',
  ].join('\n'),
  if: 'darwin',
}

// ── Helper to replace a script step containing a pattern ───────────────

function replaceScriptStep(recipe: any, match: string, newRun: string): void {
  if (!Array.isArray(recipe.build?.script)) return
  for (const step of recipe.build.script) {
    if (typeof step === 'string' && step.includes(match)) {
      const idx = recipe.build.script.indexOf(step)
      recipe.build.script[idx] = newRun
    } else if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes(match)) {
      step.run = newRun
    }
  }
}

// ════════════════════════════════════════════════════════════════════════
//  PACKAGE OVERRIDES
// ════════════════════════════════════════════════════════════════════════

export const packageOverrides: Record<string, PackageOverride> = {

  // ─── GNU packages (beyond generic mirror fix) ────────────────────────

  'gnu.org/source-highlight': {
    env: { CXXFLAGS: '-std=c++14' },
  },

  'gnu.org/bc': {
    // GNU bc uses zero-padded minor versions (1.07.1) but semver normalizes them (1.7.1)
    distributableUrl: 'https://ftpmirror.gnu.org/gnu/bc/bc-{{version.major}}.0{{version.minor}}.{{version.patch}}.tar.gz',
    modifyRecipe: (recipe: any) => {
      // Move texinfo dependency to linux-only (not needed on darwin)
      if (recipe.build?.dependencies?.['gnu.org/texinfo']) {
        delete recipe.build.dependencies['gnu.org/texinfo']
        if (!recipe.build.dependencies.linux) recipe.build.dependencies.linux = {}
        recipe.build.dependencies.linux['gnu.org/texinfo'] = '*'
      }
      // Fix sed portability and add platform-conditional make
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed -i')) {
            step.run = step.run
              .replace(/sed -i '/, "sed '")
              .replace(/' Makefile"/, "' Makefile > Makefile.tmp && mv Makefile.tmp Makefile\"")
          }
        }
        // Replace unconditional make with platform-conditional
        const makeIdx = recipe.build.script.findIndex((s: any) =>
          typeof s === 'string' && s.includes('make') && s.includes('install') && !s.includes('configure'))
        if (makeIdx >= 0) {
          recipe.build.script.splice(makeIdx, 1,
            { run: 'make --jobs {{hw.concurrency}} MAKEINFO=true install', if: 'darwin' },
            { run: 'make --jobs {{hw.concurrency}} install', if: 'linux' },
          )
        }
      }
    },
  },

  'gnu.org/texinfo': {
    modifyRecipe: (recipe: any) => {
      // Replace sed -i with perl for portability
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run) {
            if (typeof step.run === 'string' && step.run.includes('sed -i')) {
              step.run = [
                'for f in pod2texi texi2any makeinfo; do',
                '  if [ -f "$f" ]; then',
                '    perl -pi -e \'s|^#!.*/perl|#!/usr/bin/env perl|\' "$f"',
                '  fi',
                'done',
                'head makeinfo',
              ].join('\n')
            } else if (Array.isArray(step.run)) {
              const sedIdx = step.run.findIndex((s: string) => typeof s === 'string' && s.includes('sed -i'))
              if (sedIdx >= 0) {
                step.run = [
                  'for f in pod2texi texi2any makeinfo; do',
                  '  if [ -f "$f" ]; then',
                  '    perl -pi -e \'s|^#!.*/perl|#!/usr/bin/env perl|\' "$f"',
                  '  fi',
                  'done',
                  'head makeinfo',
                ].join('\n')
              }
            }
          }
        }
      }
    },
  },

  'gnu.org/wget': {
    modifyRecipe: (recipe: any) => {
      // Fix typo --without-libps1 → --without-libpsl, add missing args
      if (recipe.build?.env) {
        const args = recipe.build.env.ARGS || recipe.build.env.linux?.ARGS || recipe.build.env.darwin?.ARGS
        if (Array.isArray(args)) {
          const idx = args.indexOf('--without-libps1')
          if (idx >= 0) args[idx] = '--without-libpsl'
          if (!args.includes('--without-metalink')) args.push('--without-metalink')
          if (!args.includes('--sysconfdir={{prefix}}/etc')) args.push('--sysconfdir={{prefix}}/etc')
        }
      }
    },
  },

  'gnu.org/ed': {
    modifyRecipe: (recipe: any) => {
      // Fix in-script curl URL from ftp.gnu.org to ftpmirror
      if (recipe.build?.script) {
        const fixFtpUrls = (s: string) => s.replace(/ftp\.gnu\.org/g, 'ftpmirror.gnu.org')
        if (typeof recipe.build.script === 'string') {
          recipe.build.script = fixFtpUrls(recipe.build.script)
        } else if (Array.isArray(recipe.build.script)) {
          recipe.build.script = recipe.build.script.map((step: any) => {
            if (typeof step === 'string') return fixFtpUrls(step)
            if (typeof step === 'object' && typeof step.run === 'string') {
              step.run = fixFtpUrls(step.run)
            }
            return step
          })
        }
      }
    },
  },

  'aspell.net': {
    modifyRecipe: (recipe: any) => {
      // Fix in-script curl URL from ftp.gnu.org to ftpmirror
      if (recipe.build?.script) {
        const fixFtpUrls = (s: string) => s.replace(/ftp\.gnu\.org/g, 'ftpmirror.gnu.org')
        if (typeof recipe.build.script === 'string') {
          recipe.build.script = fixFtpUrls(recipe.build.script)
        } else if (Array.isArray(recipe.build.script)) {
          recipe.build.script = recipe.build.script.map((step: any) => {
            if (typeof step === 'string') return fixFtpUrls(step)
            if (typeof step === 'object' && typeof step.run === 'string') {
              step.run = fixFtpUrls(step.run)
            }
            return step
          })
        }
      }
    },
  },

  // ─── Hardcoded URL → templated ─────────────────────────────────────

  'github.com/DaveGamble/cJSON': {
    distributableUrl: 'https://github.com/DaveGamble/cJSON/archive/v{{version}}.tar.gz',
  },

  'github.com/skystrife/cpptoml': {
    distributableUrl: 'https://github.com/skystrife/cpptoml/archive/v{{version}}.tar.gz',
  },

  'github.com/westes/flex': {
    distributableUrl: 'https://github.com/westes/flex/releases/download/v{{version}}/flex-{{version}}.tar.gz',
  },

  'jenkins.io': {
    distributableUrl: 'https://get.jenkins.io/war-stable/{{version}}/jenkins.war',
  },

  'libexif.github.io': {
    distributableUrl: 'https://github.com/libexif/libexif/releases/download/v{{version}}/libexif-{{version}}.tar.bz2',
  },

  'libsdl.org/SDL_image': {
    distributableUrl: 'https://github.com/libsdl-org/SDL_image/releases/download/release-{{version}}/SDL2_image-{{version}}.tar.gz',
  },

  'openjpeg.org': {
    distributableUrl: 'https://github.com/uclouvain/openjpeg/archive/v{{version}}.tar.gz',
  },

  'openslide.org': {
    distributableUrl: 'https://github.com/openslide/openslide/releases/download/v{{version}}/openslide-{{version}}.tar.xz',
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  'pagure.io/libaio': {
    distributableUrl: 'https://pagure.io/libaio/archive/libaio-{{version}}/libaio-libaio-{{version}}.tar.gz',
  },

  'pwgen.sourceforge.io': {
    distributableUrl: 'https://downloads.sourceforge.net/project/pwgen/pwgen/{{version}}/pwgen-{{version}}.tar.gz',
  },

  'speex.org': {
    distributableUrl: 'https://downloads.xiph.org/releases/speex/speex-{{version}}.tar.gz',
  },

  'xiph.org/vorbis': {
    distributableUrl: 'https://downloads.xiph.org/releases/vorbis/libvorbis-{{version}}.tar.xz',
  },

  'zeromq.org': {
    distributableUrl: 'https://github.com/zeromq/libzmq/releases/download/v{{version}}/zeromq-{{version}}.tar.gz',
  },

  // ─── Source host changes (non-GNU) ─────────────────────────────────

  'frei0r.dyne.org': {
    distributableUrl: 'https://github.com/dyne/frei0r/archive/refs/tags/v{{version}}.tar.gz',
  },

  'nongnu.org/lzip': {
    distributableUrl: 'https://download.savannah.nongnu.org/releases/lzip/lzip-{{version.marketing}}.tar.gz',
  },

  'rclone.org': {
    distributableUrl: 'https://github.com/rclone/rclone/archive/v{{version}}.tar.gz',
    modifyRecipe: (recipe: any) => {
      // Remove darwin-only curl/patch dependencies (patch no longer needed)
      if (recipe.build?.dependencies?.darwin) {
        delete recipe.build.dependencies.darwin['curl.se']
        delete recipe.build.dependencies.darwin['gnu.org/patch']
      }
      // Remove the patch step and -tags cmount from ARGS
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('patch -p1')) return false
          return true
        })
      }
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => a !== '-tags cmount')
      }
    },
  },

  // ─── glibtool fix (macOS) ──────────────────────────────────────────

  'code.videolan.org/aribb24': { prependScript: [GLIBTOOL_FIX] },
  'leonerd.org.uk/libtermkey': { prependScript: [GLIBTOOL_FIX] },
  'leonerd.org.uk/libvterm': { prependScript: [GLIBTOOL_FIX] },
  'libtom.net/math': { prependScript: [GLIBTOOL_FIX] },
  'sass-lang.com/libsass': { prependScript: [GLIBTOOL_FIX] },
  'zlib.net/minizip': { prependScript: [GLIBTOOL_FIX] },

  // ─── sed portability fixes ─────────────────────────────────────────

  'amp.rs': {
    modifyRecipe: (recipe: any) => {
      // Replace sed -i -f with redirect-and-move (BSD compat)
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed -i -f')) {
            step.run = step.run.replace(
              /sed -i -f (\$\w+) (\S+)/,
              'sed -f $1 $2 > $2.new && mv $2.new $2',
            )
          }
        }
      }
      // Fix prop backslash escaping for BSD sed
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.prop) {
            if (typeof step.prop === 'string') {
              step.prop = step.prop.replace(/\\\\/g, '\\')
            }
          }
        }
      }
    },
  },

  'laravel.com': {
    modifyRecipe: (recipe: any) => {
      // Replace sed -i with perl -pi -e for portability
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed -i')) {
            step.run = step.run.replace(/sed -i (".*?")/, 'perl -pi -e $1')
          }
        }
      }
    },
    // Add ICU fix for PHP on darwin
    platforms: {
      darwin: {
        prependScript: [{
          run: [
            'brew install icu4c 2>/dev/null || true',
            'ICU_LIB="$(brew --prefix icu4c)/lib"',
            'PHP_LIB="{{deps.php.net.prefix}}/lib"',
            'if [ -d "$ICU_LIB" ] && [ -d "$PHP_LIB" ]; then',
            '  for lib in "$ICU_LIB"/libicu*.dylib; do',
            '    [ -f "$lib" ] && ln -sf "$lib" "$PHP_LIB/" 2>/dev/null || true',
            '  done',
            '  for phplib in "$PHP_LIB"/libicu*.dylib; do',
            '    [ -L "$phplib" ] && continue',
            '    [ -f "$phplib" ] || continue',
            '    for iculib in "$ICU_LIB"/libicu*.dylib; do',
            '      base="$(basename "$iculib")"',
            '      install_name_tool -change "@loader_path/$base" "$iculib" "$phplib" 2>/dev/null || true',
            '    done',
            '  done',
            'fi',
          ].join('\n'),
          if: 'darwin',
        }],
      },
    },
  },

  'libarchive.org': {
    modifyRecipe: (recipe: any) => {
      // Replace sed -i with perl for removing Requires.private iconv line
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed') && step.run.includes('iconv')) {
            step.run = "perl -ni -e 'print unless /Requires\\.private:.*iconv/' libarchive.pc"
          } else if (typeof step === 'string' && step.includes('sed') && step.includes('iconv')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = "perl -ni -e 'print unless /Requires\\.private:.*iconv/' libarchive.pc"
          }
        }
      }
    },
  },

  'swagger.io/swagger-codegen': {
    modifyRecipe: (recipe: any) => {
      // Replace sed -i with perl -pi -e in pom.xml patching
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('sed -i')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i '([^']*)'/g, "perl -pi -e '$1'")
            recipe.build.script[idx] = recipe.build.script[idx].replace(/sed -i/g, 'perl -pi -e')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed -i')) {
            step.run = step.run.replace(/sed -i '([^']*)'/g, "perl -pi -e '$1'")
            step.run = step.run.replace(/sed -i/g, 'perl -pi -e')
          }
        }
      }
    },
  },

  'quickwit.io': {
    modifyRecipe: (recipe: any) => {
      // Fix sed for cross-platform: BSD sed requires suffix arg after -i
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('build_info.rs')) {
            step.run = 'sed -i.bak \'s/ version,$/version: "{{version}}".to_string(),/\' build_info.rs\nrm -f build_info.rs.bak'
          }
        }
      }
    },
  },

  // ─── Rust crate packages ───────────────────────────────────────────

  'crates.io/mdcat': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'crates.io/gitui': {
    platforms: {
      linux: {
        env: {
          OPENSSL_DIR: '/usr',
          OPENSSL_LIB_DIR: '/usr/lib/x86_64-linux-gnu',
          OPENSSL_INCLUDE_DIR: '/usr/include',
        },
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove AR: llvm-ar on linux
      if (recipe.build?.env?.linux?.AR) {
        delete recipe.build.env.linux.AR
      }
    },
  },

  'pimalaya.org/himalaya': {
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['rust-lang.org']) {
        recipe.build.dependencies['rust-lang.org'] = '>=1.85'
      }
    },
  },

  'volta.sh': {
    prependScript: [
      {
        run: [
          'rm -f rust-toolchain.toml',
          'sed -i.bak \'s/version = "=2.1.6"/version = "2.1"/\' crates/archive/Cargo.toml',
          'rm -f crates/archive/Cargo.toml.bak',
          'rm -f Cargo.lock',
        ].join('\n'),
      },
      'rustup default stable',
    ],
  },

  'maturin.rs': {
    modifyRecipe: (recipe: any) => {
      // Remove -Znext-lockfile-bump flag (not needed, causes issues)
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('Znext-lockfile-bump')) return false
          return true
        })
        // Simplify cargo install command (remove $EXTRA_ARGS)
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('cargo install') && step.includes('$EXTRA_ARGS')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(' $EXTRA_ARGS', '')
          }
        }
      }
    },
  },

  // ─── Go packages ───────────────────────────────────────────────────

  'khanacademy.org/genqlient': {
    prependScript: [
      'go get golang.org/x/tools@latest',
      'go mod tidy',
    ],
  },

  'syncthing.net': {
    prependScript: [{
      run: [
        'if [ -f compat.yaml ] && ! grep -q \'go1.26\' compat.yaml; then',
        '  printf \'\\n- runtime: go1.26\\n  requirements:\\n    darwin: "21"\\n    linux: "3.2"\\n    windows: "10.0"\\n\' >> compat.yaml',
        'fi',
      ].join('\n'),
    }],
  },

  'eksctl.io': {
    modifyRecipe: (recipe: any) => {
      // Remove build deps that we don't have (counterfeiter, go-bindata, ifacemaker, mockery)
      const deps = recipe.build?.dependencies
      if (deps) {
        delete deps['github.com/maxbrunsfeld/counterfeiter']
        delete deps['github.com/kevinburke/go-bindata']
        delete deps['github.com/vburenin/ifacemaker']
        delete deps['vektra.github.io/mockery']
      }
      // Replace make build + install with direct go build
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = [
          'go build -trimpath -ldflags="-s -w -X github.com/eksctl-io/eksctl/v2/pkg/version.gitTag=v{{version}}" -o {{prefix}}/bin/eksctl ./cmd/eksctl',
        ]
      }
    },
  },

  'docker.com/cli': {
    modifyRecipe: (recipe: any) => {
      // Wrap man page generation in go-md2man availability check
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('go-md2man') && !step.run.includes('command -v')) {
            step.run = 'if command -v go-md2man &>/dev/null; then\n' + step.run + '\nfi'
          }
        }
      }
    },
  },

  // ─── ccache ────────────────────────────────────────────────────────

  'ccache.dev': {
    // Remove -DENABLE_IPO=TRUE from CMAKE_ARGS (generic fix handles quote)
    modifyRecipe: (recipe: any) => {
      // Remove llvm.org linux build dependency
      if (recipe.build?.dependencies?.linux) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Remove -DENABLE_IPO=TRUE
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.filter(
          (a: string) => a !== '-DENABLE_IPO=TRUE',
        )
      }
    },
    platforms: {
      linux: {
        prependScript: [
          'sudo rm -f /usr/include/xxhash.h /usr/lib/x86_64-linux-gnu/libxxhash.* /usr/lib/x86_64-linux-gnu/pkgconfig/libxxhash.pc 2>/dev/null || true',
        ],
        env: {
          CMAKE_ARGS: [
            '-DCMAKE_INSTALL_PREFIX={{prefix}}',
            '-DCMAKE_INSTALL_LIBDIR=lib',
            '-DCMAKE_BUILD_TYPE=Release',
            '-DCMAKE_VERBOSE_MAKEFILE=ON',
            '-Wno-dev',
            '-DBUILD_TESTING=OFF',
            '-DCMAKE_C_COMPILER=/usr/bin/gcc',
            '-DCMAKE_CXX_COMPILER=/usr/bin/g++',
            '-DCMAKE_NO_SYSTEM_FROM_IMPORTED=ON',
          ],
        },
      },
    },
  },

  // ─── Env var / configure arg fixes ─────────────────────────────────

  'capnproto.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-DBUILD_TESTING=OFF')) {
          recipe.build.env.ARGS.push('-DBUILD_TESTING=OFF')
        }
      }
    },
  },

  'lloyd.github.io/yajl': {
    // CMAKE prefix quote is handled by generic fix; add CMP0026 policy fix
    prependScript: [
      'cmake_policy_file="CMakeLists.txt"',
      'if [ -f "$cmake_policy_file" ] && ! grep -q "CMP0026" "$cmake_policy_file"; then sed -i.bak \'1s/^/cmake_policy(SET CMP0026 OLD)\\n/\' "$cmake_policy_file" && rm -f "$cmake_policy_file.bak"; fi',
    ],
  },

  'musepack.net': {
    // CMAKE prefix quote is handled by generic fix — no individual override needed
  },

  'oracle.com/berkeley-db': {
    platforms: {
      darwin: { env: { CXXFLAGS: '-std=c++14' } },
    },
    modifyRecipe: (recipe: any) => {
      // Remove --enable-stl from ARGS (broken on modern compilers)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => a !== '--enable-stl')
      }
    },
  },

  'postgresql.org/libpq': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--without-icu')) {
          recipe.build.env.ARGS.push('--without-icu')
        }
      }
    },
  },

  'openprinting.github.io/cups': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--sysconfdir="{{prefix}}/etc"')) {
          recipe.build.env.ARGS.push('--sysconfdir="{{prefix}}/etc"', '--localstatedir="{{prefix}}/var"')
        }
      }
    },
  },

  'linux-pam.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        const args = recipe.build.env.MESON_ARGS
        if (!args.includes('--localstatedir={{prefix}}/var')) {
          args.push('--localstatedir={{prefix}}/var')
        }
        // Remove -Dxml-catalog arg
        recipe.build.env.MESON_ARGS = args.filter((a: string) => !a.includes('-Dxml-catalog'))
        // Add -Ddocs=disabled
        if (!recipe.build.env.MESON_ARGS.includes('-Ddocs=disabled')) {
          recipe.build.env.MESON_ARGS.push('-Ddocs=disabled')
        }
      }
    },
  },

  'sourceforge.net/xmlstar': {
    env: {
      CFLAGS: '$CFLAGS -I{{deps.gnome.org/libxml2.prefix}}/include/libxml2',
      CPPFLAGS: '-I{{deps.gnome.org/libxml2.prefix}}/include/libxml2',
    },
    modifyRecipe: (recipe: any) => {
      // Add gnome.org/libxml2 runtime dependency
      if (recipe.dependencies) {
        recipe.dependencies['gnome.org/libxml2'] = '^2'
      }
    },
  },

  // ─── Complex build script fixes ────────────────────────────────────

  'agwa.name/git-crypt': {
    modifyRecipe: (recipe: any) => {
      // Remove docbook dependencies (we build without man pages)
      const deps = recipe.build?.dependencies
      if (deps) {
        delete deps['docbook.org']
        delete deps['docbook.org/xsl']
        delete deps['gnome.org/libxslt']
      }
      // Remove XML_CATALOG_FILES env
      if (recipe.build?.env) {
        delete recipe.build.env.XML_CATALOG_FILES
      }
      // Change ENABLE_MAN=yes to ENABLE_MAN=no and remove sed docbook step
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'string' && step.includes('docbook')) return false
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('docbook')) return false
          return true
        })
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string') {
            recipe.build.script[i] = step.replace('ENABLE_MAN=yes', 'ENABLE_MAN=no')
          } else if (typeof step === 'object' && typeof step.run === 'string') {
            step.run = step.run.replace('ENABLE_MAN=yes', 'ENABLE_MAN=no')
          }
        }
      }
    },
  },

  'harlequin.sh': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('pip install') && step.includes('[')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = '"{{prefix}}/venv/bin/pip install \'.[postgres,mysql,odbc,sqlite]\'"'
          }
          // Fix pyodbc dynamic find
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('install_name_tool') && step.run.includes('pyodbc')) {
            step.run = [
              'PYODBC=$(find {{prefix}}/venv/lib -name \'pyodbc.cpython-*-darwin.so\' 2>/dev/null | head -1)',
              'if [ -n "$PYODBC" ]; then',
              '  install_name_tool -change ${HOMEBREW_PREFIX}/opt/unixodbc/lib/libodbc.2.dylib {{deps.unixodbc.org.prefix}}/lib/libodbc.2.dylib "$PYODBC"',
              'fi',
            ].join('\n')
          }
        }
      }
    },
  },

  'gstreamer.freedesktop.org/orc': {
    modifyRecipe: (recipe: any) => {
      // Replace single meson call with platform-conditional calls (darwin needs pip3 meson fix)
      if (Array.isArray(recipe.build?.script)) {
        const mesonIdx = recipe.build.script.findIndex((step: any) => {
          if (typeof step === 'string') return step.includes('meson') && step.includes('$ARGS') && step.includes('..')
          if (typeof step === 'object' && step.run) {
            const run = typeof step.run === 'string' ? step.run : ''
            return run.includes('meson') && run.includes('$ARGS') && run.includes('..')
          }
          return false
        })
        if (mesonIdx >= 0) {
          recipe.build.script.splice(mesonIdx, 1,
            {
              run: [
                'pip3 install --break-system-packages meson 2>/dev/null || pip3 install meson',
                'printf \'#!/usr/bin/env python3\\nfrom mesonbuild.mesonmain import main\\nmain()\\n\' > "$(which meson)"',
                'chmod +x "$(which meson)"',
                'meson setup $ARGS ..',
              ].join('\n'),
              if: 'darwin',
            },
            { run: 'meson $ARGS ..', if: 'linux' },
          )
        }
      }
    },
  },

  'videolan.org/x265': {
    modifyRecipe: (recipe: any) => {
      // Move nasm.us dependency to linux-only (assembly disabled on darwin)
      if (recipe.build?.dependencies?.['nasm.us']) {
        delete recipe.build.dependencies['nasm.us']
        if (!recipe.build.dependencies.linux) recipe.build.dependencies.linux = {}
        recipe.build.dependencies.linux['nasm.us'] = '*'
      }
      // Add -DENABLE_ASSEMBLY=OFF on darwin to all cmake invocations
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('cmake ../source')) {
            // Inject darwin assembly check before each cmake call
            step.run = step.run.replace(
              /cmake \.\.\/source/g,
              'DARWIN_ARGS=""\n[ "$(uname)" = "Darwin" ] && DARWIN_ARGS="-DENABLE_ASSEMBLY=OFF"\ncmake ../source $DARWIN_ARGS',
            )
          }
        }
      }
    },
  },

  'jemalloc.net': {
    // Rename 'version' file to avoid C++ #include <version> collision on modern Xcode
    prependScript: ['if [ -f version ]; then mv version VERSION.jemalloc; fi'],
    modifyRecipe: (recipe: any) => {
      // Fix working-directory for the sed command
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('jemalloc.h') && step['working-directory'] === '${{prefix}}/include') {
            step['working-directory'] = '${{prefix}}/include/jemalloc'
          }
        }
      }
    },
  },

  'invisible-island.net/ncurses': {
    modifyRecipe: (recipe: any) => {
      // Fix all ln -s to ln -sf to avoid failure when symlinks already exist
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('ln -s ')) {
            recipe.build.script[i] = step.replace(/\bln -s /g, 'ln -sf ')
          } else if (typeof step === 'object' && step.run) {
            if (typeof step.run === 'string') {
              step.run = step.run.replace(/\bln -s /g, 'ln -sf ')
            } else if (Array.isArray(step.run)) {
              step.run = step.run.map((s: string) => s.replace(/\bln -s /g, 'ln -sf '))
            }
          }
        }
      }
    },
  },

  'python.org/typing_extensions': {
    modifyRecipe: (recipe: any) => {
      // Remove flit.pypa.io build dependency
      if (recipe.build?.dependencies) {
        delete recipe.build.dependencies['flit.pypa.io']
      }
      // Simplify script: use pip install . instead of flit build + pip install wheel
      if (recipe.build?.script) {
        if (typeof recipe.build.script === 'string') {
          recipe.build.script = 'python -m pip install --prefix={{prefix}} .'
        } else if (Array.isArray(recipe.build.script)) {
          recipe.build.script = ['python -m pip install --prefix={{prefix}} .']
        }
      }
    },
  },

  'libsoup.org': {
    modifyRecipe: (recipe: any) => {
      // Add patchelf as linux build dep
      if (recipe.build?.dependencies) {
        if (!recipe.build.dependencies.linux) recipe.build.dependencies.linux = {}
        recipe.build.dependencies.linux['nixos.org/patchelf'] = '*'
      }
      // Add patchelf step for libsqlite3.so on linux
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script.push({
          run: [
            'SQLITE="$(ldd libsoup-*.so | sed -n \'/libsqlite3.so/s/=>.*//p\'")',
            'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so libsoup-*.so',
          ].join('\n'),
          'working-directory': '{{prefix}}/lib',
          if: 'linux',
        })
      }
      // Fix --prefix and --libdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
        // Disable introspection and vala
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled', '-Dvapi=disabled')
        }
      }
      // Remove gobject-introspection and vala build deps
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      if (recipe.build?.dependencies?.['gnome.org/vala']) {
        delete recipe.build.dependencies['gnome.org/vala']
      }
      // Remove kerberos.org dep (not in S3)
      if (recipe.dependencies?.['kerberos.org']) {
        delete recipe.dependencies['kerberos.org']
      }
      // Remove linux CC/CXX/LD override
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  'gnupg.org/libgcrypt': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['gnupg.org/libgpg-error']) {
        recipe.build.dependencies['gnupg.org/libgpg-error'] = '^1.51'
      }
    },
  },

  // ─── Strip-components overrides ────────────────────────────────────

  'docbook.org/xsl': {
    stripComponents: 0,
  },

  'pkgx.sh/pkgm': {
    stripComponents: 0,
  },

  // ════════════════════════════════════════════════════════════════════════
  //  FIXES FOR PREVIOUSLY-BROKEN PACKAGES
  // ════════════════════════════════════════════════════════════════════════

  // ─── gnome.org/libxml2 — sed -i BSD fix + remove --with-python on darwin ──

  'gnome.org/libxml2': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i (BSD requires suffix) in the xml2-config rewrite step
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('xml2-config')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove --with-python (fragile on macOS, not needed for lib)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => a !== '--with-python')
      }
      // Remove doxygen.nl build dep (not needed without docs)
      if (recipe.build?.dependencies?.['doxygen.nl']) {
        delete recipe.build.dependencies['doxygen.nl']
      }
    },
  },

  // ─── gnome.org/glib — disable introspection, fix sed -i BSD ─────────────

  'gnome.org/glib': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep (circular dep chain)
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove gnome.org/libxml2 build dep (not strictly needed)
      if (recipe.build?.dependencies?.['gnome.org/libxml2']) {
        delete recipe.build.dependencies['gnome.org/libxml2']
      }
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => !a.includes('introspection'))
        recipe.build.env.ARGS.push('-Dintrospection=disabled')
      }
      // Fix sed -i calls in build script (BSD requires suffix)
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i -e')) {
            step.run = step.run.replace(/sed -i -e /g, 'sed -i.bak -e ')
          }
        }
      }
    },
  },

  // ─── freedesktop.org/dbus — remove xmlto dep, disable docs ──────────────

  'freedesktop.org/dbus': {
    modifyRecipe: (recipe: any) => {
      // pagure.io/xmlto is linux-only (BSD getopt incompatibility on macOS)
      if (recipe.build?.dependencies?.['pagure.io/xmlto']) {
        delete recipe.build.dependencies['pagure.io/xmlto']
      }
      // Add meson args to skip xmlto-dependent doc generation
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        for (const flag of ['-Ddoc_xml_dtd=no', '-Ddoxygen_docs=disabled', '-Dxml_docs=disabled']) {
          if (!recipe.build.env.MESON_ARGS.includes(flag)) {
            recipe.build.env.MESON_ARGS.push(flag)
          }
        }
      }
    },
  },

  // ─── x.org/ice — fix $SHELF variable references ──────────────────────────

  'x.org/ice': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/"\$SHELF"\/etc/, '"{{prefix}}/etc"')
           .replace(/"\$SHELF"\/var/, '"{{prefix}}/var"'),
        )
      }
    },
  },

  // ─── x.org/sm — fix $SHELF variable references ───────────────────────────

  'x.org/sm': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string') {
            recipe.build.script[i] = step
              .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
              .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
          } else if (typeof step === 'object' && typeof step.run === 'string') {
            step.run = step.run
              .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
              .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
          }
        }
      }
    },
  },

  // ─── x.org/xt — fix $SHELF variable references ───────────────────────────

  'x.org/xt': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string') {
            recipe.build.script[i] = step
              .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
              .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
              .replace(/"\$SHELF"\/etc\/X11\/app-defaults/g, '"{{prefix}}/etc/X11/app-defaults"')
          } else if (typeof step === 'object' && typeof step.run === 'string') {
            step.run = step.run
              .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
              .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
              .replace(/"\$SHELF"\/etc\/X11\/app-defaults/g, '"{{prefix}}/etc/X11/app-defaults"')
          }
        }
      }
    },
  },

  // ─── x.org/xmu — fix $SHELF variable references ──────────────────────────

  'x.org/xmu': {
    modifyRecipe: (recipe: any) => {
      if (typeof recipe.build?.script === 'string') {
        recipe.build.script = recipe.build.script
          .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
          .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
      } else if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string') {
            recipe.build.script[i] = step
              .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
              .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
          }
        }
      }
    },
  },

  // ─── x.org/xaw — fix $SHELF variable references ──────────────────────────

  'x.org/xaw': {
    modifyRecipe: (recipe: any) => {
      if (typeof recipe.build?.script === 'string') {
        recipe.build.script = recipe.build.script
          .replace(/"\$SHELF"\/etc/g, '"{{prefix}}/etc"')
          .replace(/"\$SHELF"\/var/g, '"{{prefix}}/var"')
      }
    },
  },

  // ─── xkbcommon.org — remove XKeyboardConfig dep, fix meson args ──────────

  'xkbcommon.org': {
    modifyRecipe: (recipe: any) => {
      // Remove freedesktop.org/XKeyboardConfig dep (not in S3)
      if (recipe.dependencies?.['freedesktop.org/XKeyboardConfig']) {
        delete recipe.dependencies['freedesktop.org/XKeyboardConfig']
      }
      if (recipe.dependencies?.['gnome.org/libxml2']) {
        delete recipe.dependencies['gnome.org/libxml2']
      }
      // Remove XKeyboardConfig path refs from meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.filter(
          (a: string) => !a.includes('xkb-config-root') && !a.includes('x-locale-root'),
        )
      }
    },
  },

  // ─── libimobiledevice.org/libplist — fix sed -i BSD ─────────────────────

  'libimobiledevice.org/libplist': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('+brewing')) {
            step.run = step.run.replace(/sed -i '/g, "sed -i.bak '")
          }
        }
      }
    },
  },

  // ─── libimobiledevice.org/libusbmuxd — fix sed -i BSD ───────────────────

  'libimobiledevice.org/libusbmuxd': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('+brewing')) {
            step.run = step.run.replace(/sed -i '/g, "sed -i.bak '")
          }
        }
      }
    },
  },

  // ─── libimobiledevice.org/libimobiledevice-glue — add glibtool fix ──────

  'libimobiledevice.org/libimobiledevice-glue': {
    prependScript: [GLIBTOOL_FIX],
  },

  // ─── libimobiledevice.org/libtatsu — remove libpsl dep ──────────────────

  'libimobiledevice.org/libtatsu': {
    prependScript: [GLIBTOOL_FIX],
    modifyRecipe: (recipe: any) => {
      // Remove rockdaboot.github.io/libpsl dep (not in S3)
      if (recipe.dependencies?.['rockdaboot.github.io/libpsl']) {
        delete recipe.dependencies['rockdaboot.github.io/libpsl']
      }
    },
  },

  // ─── libimobiledevice.org — fix sed -i BSD ───────────────────────────────

  'libimobiledevice.org': {
    prependScript: [GLIBTOOL_FIX],
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('PLIST_FORMAT')) {
            step.run = step.run.replace(/sed -i '/g, "sed -i.bak '")
          }
        }
      }
    },
  },

  // ─── mozilla.org/nss — fix sed -i BSD + use system clang on darwin ───────

  'mozilla.org/nss': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i (BSD requires suffix)
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove llvm.org dep on darwin/aarch64 — use system clang
      if (recipe.build?.dependencies?.['darwin/aarch64']) {
        delete recipe.build.dependencies['darwin/aarch64']['llvm.org']
      }
      if (recipe.build?.env?.['darwin/aarch64']?.CC) {
        recipe.build.env['darwin/aarch64'].CC = 'clang'
      }
    },
  },

  // ─── openpmix.github.io — remove --with-sge (SGE not in CI) ─────────────

  'openpmix.github.io': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => a !== '--with-sge')
      }
    },
  },

  // ─── developers.yubico.com/libfido2 — remove systemd.io dep ─────────────

  'developers.yubico.com/libfido2': {
    modifyRecipe: (recipe: any) => {
      // systemd.io is broken — use system libudev instead
      if (recipe.dependencies?.linux?.['systemd.io']) {
        delete recipe.dependencies.linux['systemd.io']
      }
      if (recipe.dependencies?.['systemd.io']) {
        delete recipe.dependencies['systemd.io']
      }
    },
  },

  // ─── chiark.greenend.org.uk/puzzles — remove halibut dep ─────────────────

  'chiark.greenend.org.uk/puzzles': {
    modifyRecipe: (recipe: any) => {
      // Remove chiark.greenend.org.uk/halibut dep (not available in CI)
      if (recipe.build?.dependencies?.['chiark.greenend.org.uk/halibut']) {
        delete recipe.build.dependencies['chiark.greenend.org.uk/halibut']
      }
      // Remove llvm.org linux dep (use system clang)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Remove imagemagick.org linux dep
      if (recipe.build?.dependencies?.linux?.['imagemagick.org']) {
        delete recipe.build.dependencies.linux['imagemagick.org']
      }
    },
  },

  // ─── deepwisdom.ai — linux: patch out faiss_cpu requirement ──────────────

  'deepwisdom.ai': {
    platforms: {
      linux: {
        prependScript: [{
          run: [
            'if [ -f requirements.txt ]; then sed -i.bak "/faiss.cpu/d" requirements.txt && rm -f requirements.txt.bak; fi',
            'if [ -f pyproject.toml ]; then sed -i.bak "/faiss.cpu/d" pyproject.toml && rm -f pyproject.toml.bak; fi',
          ].join('\n'),
          if: 'linux',
        }],
      },
    },
  },

  // ─── expo.dev/eas-cli — use corepack to enable yarn 4 ───────────────────

  'expo.dev/eas-cli': {
    prependScript: [{
      run: [
        'corepack enable 2>/dev/null || npm install -g corepack 2>/dev/null || true',
        'corepack prepare yarn@stable --activate 2>/dev/null || true',
      ].join('\n'),
    }],
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in the version bump step
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('package.json')) {
            step.run = step.run.replace(/sed -i '/, "sed -i.bak '")
          }
        }
      }
    },
  },

  // ─── nx.dev — npm install with legacy peer deps ──────────────────────────

  'nx.dev': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--legacy-peer-deps')) {
          recipe.build.env.ARGS.push('--legacy-peer-deps')
        }
      }
    },
  },

  // ─── snaplet.dev/cli — npm install with legacy peer deps ─────────────────

  'snaplet.dev/cli': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('npm install')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step + '\n      --legacy-peer-deps'
          }
        }
      }
    },
  },

  // ─── ceph.com/cephadm — fix sed -i BSD ───────────────────────────────────

  'ceph.com/cephadm': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('shebang')) {
            step.run = step.run.replace(/sed -i "/g, 'sed -i.bak "')
          }
        }
      }
    },
  },

  // ─── rockdaboot.github.io/libpsl — switch to libidn2 runtime ─────────────

  'rockdaboot.github.io/libpsl': {
    modifyRecipe: (recipe: any) => {
      // Remove unicode.org dep (not in S3) — use libidn2 instead
      if (recipe.dependencies?.['unicode.org']) {
        delete recipe.dependencies['unicode.org']
      }
      // Switch from libicu runtime to libidn2 (available via system)
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a === '-Druntime=libicu' ? '-Druntime=libidn2' : a,
        )
      }
    },
  },

  // ─── matio.sourceforge.io — build without HDF5 (broken dep) ─────────────

  'matio.sourceforge.io': {
    modifyRecipe: (recipe: any) => {
      // Remove hdfgroup.org/HDF5 dep (broken/not in S3)
      if (recipe.dependencies?.['hdfgroup.org/HDF5']) {
        delete recipe.dependencies['hdfgroup.org/HDF5']
      }
      // Remove darwin llvm.org build dep
      if (recipe.build?.dependencies?.darwin?.['llvm.org']) {
        delete recipe.build.dependencies.darwin['llvm.org']
      }
      // Disable HDF5 and MAT73 in cmake args
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) => {
          if (a === '-DMATIO_WITH_HDF5=ON') return '-DMATIO_WITH_HDF5=OFF'
          if (a === '-DMATIO_MAT73=ON') return '-DMATIO_MAT73=OFF'
          return a
        })
      }
      // Also fix configure ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => !a.includes('hdf5') && !a.includes('mat73'),
        )
        recipe.build.env.ARGS.push('--with-hdf5=no', '--enable-mat73=no')
      }
    },
  },

  // ─── unidata.ucar.edu/netcdf — fix sed -i BSD ────────────────────────────

  'unidata.ucar.edu/netcdf': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i (BSD requires suffix) in cmake fixup steps
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ════════════════════════════════════════════════════════════════════════
  //  ADDITIONAL FIXES FOR knownBrokenDomains PACKAGES
  // ════════════════════════════════════════════════════════════════════════

  // ─── Rust crate fixes (cap-lints, toolchain) ──────────────────────────

  'crates.io/bpb': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'crates.io/drill': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'crates.io/mask': {
    env: { RUSTFLAGS: '--cap-lints warn -C linker=gcc' },
    prependScript: ['rm -f rust-toolchain.toml'],
  },

  'crates.io/pqrs': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'crates.io/rust-kanban': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'crates.io/spider_cli': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'fabianlindfors.se/reshape': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'crates.io/didyoumean': {
    env: { RUSTFLAGS: '--cap-lints warn' },
  },

  'iroh.computer': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'dns.lookup.dog': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'crates.io/zellij': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'radicle.org': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
  },

  'orhun.dev/gpg-tui': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    modifyRecipe: (recipe: any) => {
      // Add gnupg.org/gpgme as dependency (needed for gpgme-sys crate)
      if (!recipe.dependencies) recipe.dependencies = {}
      recipe.dependencies['gnupg.org/gpgme'] = '*'
    },
  },

  'crates.io/skim': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    modifyRecipe: (recipe: any) => {
      // Remove --features nightly-frizbee (feature removed in newer versions)
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('nightly-frizbee')) {
            recipe.build.script[i] = step.replace(' --features nightly-frizbee', '')
          } else if (typeof step === 'object' && typeof step.run === 'string' && step.run.includes('nightly-frizbee')) {
            step.run = step.run.replace(' --features nightly-frizbee', '')
          }
        }
      }
    },
  },

  // ─── cmake.org — reduce parallel jobs to prevent race condition ───────

  'cmake.org': {
    platforms: {
      linux: {
        prependScript: [
          // Fix bzip2 multiarch path on Ubuntu (libbz2.so is in /usr/lib/x86_64-linux-gnu, not /usr/lib)
          'BZ2_REAL=$(find /usr/lib -name "libbz2.so" -print -quit 2>/dev/null); if [ -n "$BZ2_REAL" ] && [ ! -f /usr/lib/libbz2.so ]; then ln -sf "$BZ2_REAL" /usr/lib/libbz2.so 2>/dev/null || true; fi',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Replace hw.concurrency with a fixed job count to prevent race condition
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('make') && step.includes('install')) {
            recipe.build.script[i] = step.replace('{{hw.concurrency}}', '4')
          } else if (typeof step === 'object' && typeof step.run === 'string'
            && step.run.includes('make') && step.run.includes('install')) {
            step.run = step.run.replace('{{hw.concurrency}}', '4')
          }
        }
      }
    },
  },

  // ─── sourceforge.net/libtirpc — fix libtool and linker ───────────────

  'sourceforge.net/libtirpc': {
    prependScript: [GLIBTOOL_FIX],
    modifyRecipe: (recipe: any) => {
      // Remove llvm.org and LD=ld.lld on Linux (causes libtool failures)
      if (recipe.build?.dependencies?.linux) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.LD
      }
      // Add --enable-shared to ARGS to force shared library creation
      if (recipe.build?.env?.ARGS && Array.isArray(recipe.build.env.ARGS)) {
        recipe.build.env.ARGS.push('--enable-shared')
      }
      // Ensure standard make is used
      if (recipe.build?.dependencies?.linux?.['gnu.org/make']) {
        // keep it
      }
    },
  },

  // ─── gnu.org/gmp — URL override (gmplib.org unreachable) ─────────────

  'gnu.org/gmp': {
    distributableUrl: 'https://ftpmirror.gnu.org/gnu/gmp/gmp-{{version}}.tar.xz',
  },

  // pcre.org — original sourceforge URL is correct for PCRE1 (v8.x)
  // (PCRE2 is a separate project with versions starting at 10.x)

  // ─── gnu.org/gcc — clean LIBRARY_PATH of current directory entries ──────

  'gnu.org/gcc': {
    prependScript: [
      // GCC configure rejects LIBRARY_PATH containing current directory
      'export LIBRARY_PATH=$(echo "$LIBRARY_PATH" | tr ":" "\\n" | grep -v "^\\.$" | grep -v "^$" | tr "\\n" ":" | sed "s/:$//")',
      'export LD_LIBRARY_PATH=$(echo "$LD_LIBRARY_PATH" | tr ":" "\\n" | grep -v "^\\.$" | grep -v "^$" | tr "\\n" ":" | sed "s/:$//")',
    ],
  },

  // ─── getclipboard.app — fix include path for stdlib.h ────────────────

  'getclipboard.app': {
    platforms: {
      linux: {
        env: {
          CFLAGS: '-isystem /usr/include',
          CXXFLAGS: '-isystem /usr/include',
        },
        // Clear buildkit wrapper include paths that shadow system headers
        prependScript: ['unset C_INCLUDE_PATH CPLUS_INCLUDE_PATH 2>/dev/null || true'],
      },
    },
  },

  // ─── tsl0922.github.io/ttyd — fix socket API compilation ─────────────

  'tsl0922.github.io/ttyd': {
    env: {
      CFLAGS: '-Wno-error=implicit-function-declaration',
    },
    modifyRecipe: (recipe: any) => {
      // Add json-c as a build dependency (needed for json.h)
      if (!recipe.build) recipe.build = {}
      if (!recipe.build.dependencies) recipe.build.dependencies = {}
      recipe.build.dependencies['github.com/json-c/json-c'] = '*'
    },
  },

  // ─── strace.io — fix btrfs static assertions ────────────────────────

  'strace.io': {
    env: {
      CFLAGS: '-Wno-error -DBTRFS_LABEL_SIZE=256 -DBTRFS_EXTENT_REF_V0_KEY=0 -DBTRFS_SHARED_BLOCK_REF_KEY=182',
    },
  },

  // ─── microbrew.org/md5sha1sum — fix OpenSSL paths ────────────────────

  'microbrew.org/md5sha1sum': {
    modifyRecipe: (recipe: any) => {
      // Fix OpenSSL include/lib paths for multiarch Linux
      if (recipe.build?.env) {
        recipe.build.env.SSLINCPATH = '{{deps.openssl.org.prefix}}/include'
        recipe.build.env.SSLLIBPATH = '{{deps.openssl.org.prefix}}/lib'
      }
    },
  },

  // geoff.greer.fm/ag — depends on pcre.org which uses sourceforge URL
  // ag v2.2.0 only supports PCRE1 (not PCRE2), so we keep the pcre.org dep as-is

  // ─── doxygen.nl — fix build on darwin ───────────────────────────────

  'doxygen.nl': {
    modifyRecipe: (recipe: any) => {
      // Remove llvm.org dep on linux (use system compiler)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
    },
  },

  // ─── apache.org/apr-util — fix --with-apr path quoting ──────────────

  'apache.org/apr-util': {
    modifyRecipe: (recipe: any) => {
      // Fix --with-apr arg: remove extra quotes around path (causes "not found" error)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) => {
          if (a.includes('--with-apr=')) {
            return a.replace(/--with-apr="([^"]+)"/, '--with-apr=$1')
          }
          if (a.includes('--prefix=')) {
            return a.replace(/--prefix="([^"]+)"/, '--prefix=$1')
          }
          return a
        })
      }
    },
  },

  // ─── apache.org/httpd — fix sed -i BSD compat ────────────────────────

  'apache.org/httpd': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat (macOS requires suffix)
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── apache.org/thrift — fix darwin build ────────────────────────────

  'apache.org/thrift': {
    modifyRecipe: (recipe: any) => {
      // Remove duplicate --prefix arg
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        const seen = new Set<string>()
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => {
          const key = a.startsWith('--prefix') ? '--prefix' : a
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
      }
    },
  },

  // ─── vim.org — simplify deps to avoid complex dep chain ──────────────

  'vim.org': {
    modifyRecipe: (recipe: any) => {
      // Remove perl/ruby interpreters (complex deps) — keep python/lua/ncurses
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) =>
          a !== '--enable-perlinterp' && a !== '--enable-rubyinterp',
        )
      }
      // Remove perl.org and ruby-lang.org runtime deps
      if (recipe.dependencies?.['perl.org']) delete recipe.dependencies['perl.org']
      if (recipe.dependencies?.['ruby-lang.org']) delete recipe.dependencies['ruby-lang.org']
    },
  },

  // ─── gnome.org/gobject-introspection — fix sed -i BSD + CC ──────────

  'gnome.org/gobject-introspection': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in g-ir-scanner shebang fix
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('g-ir-scanner')
            && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove hardcoded CC: clang (let build system choose)
      if (recipe.build?.env?.CC === 'clang') {
        delete recipe.build.env.CC
      }
    },
  },

  // ─── gnome.org/atk — disable gobject-introspection build dep ─────────

  'gnome.org/atk': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep (not in S3 yet)
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Add -Dintrospection=disabled to meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.ARGS.push('-Dintrospection=disabled')
        }
      }
    },
  },

  // ─── gnome.org/json-glib — fix sed -i BSD + disable introspection ────

  'gnome.org/json-glib': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in json-scanner.c patch
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('json-scanner')
            && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.filter(
          (a: string) => a !== '-Dintrospection=enabled',
        )
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled')
        }
      }
    },
  },

  // ─── gnome.org/gdk-pixbuf — remove shared-mime-info dep ─────────────

  'gnome.org/gdk-pixbuf': {
    modifyRecipe: (recipe: any) => {
      // Remove freedesktop.org/shared-mime-info dep (not in S3)
      if (recipe.dependencies?.['freedesktop.org/shared-mime-info']) {
        delete recipe.dependencies['freedesktop.org/shared-mime-info']
      }
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled')
        }
      }
    },
  },

  // ─── gnome.org/pango — disable introspection ─────────────────────────

  'gnome.org/pango': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Add -Dintrospection=disabled to meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.ARGS.push('-Dintrospection=disabled')
        }
      }
    },
  },

  // ─── gnome.org/gsettings-desktop-schemas — disable introspection ─────

  'gnome.org/gsettings-desktop-schemas': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Add -Dintrospection=disabled to meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.ARGS.push('-Dintrospection=disabled')
        }
      }
    },
  },

  // ─── gnome.org/libsecret — remove heavy build deps ───────────────────

  'gnome.org/libsecret': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection, vala, libxslt, docbook build deps
      const heavyDeps = [
        'gnome.org/gobject-introspection',
        'gnome.org/vala',
        'gnome.org/libxslt',
        'docbook.org/xsl',
      ]
      for (const dep of heavyDeps) {
        if (recipe.build?.dependencies?.[dep]) {
          delete recipe.build.dependencies[dep]
        }
      }
      // Remove llvm.org linux build dep
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Disable introspection and vapi in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS.push(
          '-Dintrospection=false',
          '-Dvapi=false',
          '-Dgtk_doc=false',
        )
      }
      // Remove XML_CATALOG_FILES (docbook no longer needed)
      if (recipe.build?.env?.XML_CATALOG_FILES) {
        delete recipe.build.env.XML_CATALOG_FILES
      }
    },
  },

  // ─── ffmpeg.org — fix build on darwin (disable SDL for headless CI) ──

  'ffmpeg.org': {
    modifyRecipe: (recipe: any) => {
      // Remove libsdl.org dep (not needed for headless CI builds)
      if (recipe.dependencies?.['libsdl.org']) {
        delete recipe.dependencies['libsdl.org']
      }
      // Add --disable-sdl2 to ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--disable-sdl2')) {
          recipe.build.env.ARGS.push('--disable-sdl2')
        }
      }
    },
  },

  // ─── gnutls.org — remove p11-kit dep (not in S3) ────────────────────

  'gnutls.org': {
    modifyRecipe: (recipe: any) => {
      // Remove freedesktop.org/p11-kit dep (not in S3)
      if (recipe.dependencies?.['freedesktop.org/p11-kit']) {
        delete recipe.dependencies['freedesktop.org/p11-kit']
      }
      // Add --without-p11-kit to ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--without-p11-kit')) {
          recipe.build.env.ARGS.push('--without-p11-kit')
        }
      }
      // Fix sed -i BSD compat in aarch64 step
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && step.run.includes('-march=all')
            && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── gnu.org/guile — fix sed -i BSD compat ───────────────────────────

  'gnu.org/guile': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in guile-config and guild fixup steps
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            recipe.build.script[i] = step.replace(/sed -i /g, 'sed -i.bak ')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── gnuplot.info — remove libavif dep (not in S3) ───────────────────

  'gnuplot.info': {
    modifyRecipe: (recipe: any) => {
      // Remove linux-only libavif dep (not in S3)
      if (recipe.dependencies?.linux?.['github.com/AOMediaCodec/libavif']) {
        delete recipe.dependencies.linux['github.com/AOMediaCodec/libavif']
      }
    },
  },

  // ─── leptonica.org — fix prefix quoting ──────────────────────────────

  'leptonica.org': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^--prefix="([^"]+)"$/, '--prefix=$1'),
        )
      }
    },
  },

  // ─── tesseract-ocr.github.io — fix prefix quoting ────────────────────

  'tesseract-ocr.github.io': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and --datarootdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── proj.org — fix sha256sum on darwin (use shasum -a 256) ──────────

  'proj.org': {
    modifyRecipe: (recipe: any) => {
      // Replace sha256sum with shasum -a 256 for darwin compat
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('sha256sum')) {
            recipe.build.script[i] = step.replace(/sha256sum/g, 'shasum -a 256')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sha256sum')) {
            step.run = step.run.replace(/sha256sum/g, 'shasum -a 256')
          }
        }
      }
    },
  },

  // ─── qpdf.sourceforge.io — remove gnutls dep (use openssl) ──────────

  'qpdf.sourceforge.io': {
    modifyRecipe: (recipe: any) => {
      // Remove gnutls.org dep — qpdf can use openssl instead
      if (recipe.dependencies?.['gnutls.org']) {
        delete recipe.dependencies['gnutls.org']
      }
      // Remove linux gcc 14 build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── poppler.freedesktop.org — disable gobject-introspection ─────────

  'poppler.freedesktop.org': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove linux gcc 14 build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Fix stray quote in CMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}"' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Disable glib/gobject in cmake args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-DENABLE_GLIB=OFF')) {
          recipe.build.env.ARGS.push('-DENABLE_GLIB=OFF')
        }
      }
    },
  },

  // ─── gnome.org/librsvg — disable introspection ───────────────────────

  'gnome.org/librsvg': {
    prependScript: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Disable introspection in configure ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '--enable-introspection=yes' ? '--enable-introspection=no' : a,
        )
      }
      // Disable introspection in meson MESON_ARGS
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a === '-Dintrospection=enabled' ? '-Dintrospection=disabled' : a,
        )
      }
    },
  },

  // ─── grpc.io — fix cmake prefix quoting ──────────────────────────────

  'grpc.io': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.COMMON_ARGS)) {
        recipe.build.env.COMMON_ARGS = recipe.build.env.COMMON_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}"' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove linux clang/lld override (use system compiler)
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── videolan.org/libplacebo — remove linux gcc dep ──────────────────

  'videolan.org/libplacebo': {
    modifyRecipe: (recipe: any) => {
      // Remove linux gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── freedesktop.org/xcb-util-image — fix prefix quoting ────────────

  'freedesktop.org/xcb-util-image': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── gnome.org/PyGObject — fix prefix quoting ────────────────────────

  'gnome.org/PyGObject': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── ebassi.github.io/graphene — disable gobject-introspection ───────

  'ebassi.github.io/graphene': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
        // Add -Dintrospection=false
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=false')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=false')
        }
      }
    },
  },

  // ─── debian.org/iso-codes — fix prefix quoting ───────────────────────

  'debian.org/iso-codes': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes in CONFIGURE_ARGS
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── ibr.cs.tu-bs.de/libsmi — fix prefix quoting ─────────────────────

  'ibr.cs.tu-bs.de/libsmi': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── wireshark.org — fix stray cmake prefix quote + remove ibr dep ───

  'wireshark.org': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove ibr.cs.tu-bs.de/libsmi dep (not in S3, optional)
      if (recipe.dependencies?.['ibr.cs.tu-bs.de/libsmi']) {
        delete recipe.dependencies['ibr.cs.tu-bs.de/libsmi']
      }
      // Disable SMI in cmake args
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DENABLE_SMI=ON' ? '-DENABLE_SMI=OFF' : a,
        )
        // Also remove the SMI include dir arg
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.filter(
          (a: string) => !a.includes('libsmi'),
        )
      }
    },
  },

  // ─── jpeg.org/jpegxl — fix build on darwin ───────────────────────────

  'jpeg.org/jpegxl': {
    modifyRecipe: (recipe: any) => {
      // Add -DJPEGXL_ENABLE_OPENEXR=OFF to avoid openexr dep issues
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-DJPEGXL_ENABLE_OPENEXR=OFF')) {
          recipe.build.env.ARGS.push('-DJPEGXL_ENABLE_OPENEXR=OFF')
        }
      }
    },
  },

  // ─── mpv.io — remove vapoursynth dep (not in S3 yet) ─────────────────

  'mpv.io': {
    modifyRecipe: (recipe: any) => {
      // Remove vapoursynth.com dep (not in S3 yet)
      if (recipe.dependencies?.['vapoursynth.com']) {
        delete recipe.dependencies['vapoursynth.com']
      }
      // Disable vapoursynth in meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '-Dvapoursynth=enabled' ? '-Dvapoursynth=disabled' : a,
        )
      }
      // Remove linux clang/lld override (use system compiler)
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── gtk.org/gtk3 — disable introspection + remove heavy deps ────────

  'gtk.org/gtk3': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove docbook build deps
      if (recipe.build?.dependencies?.['docbook.org']) delete recipe.build.dependencies['docbook.org']
      if (recipe.build?.dependencies?.['docbook.org/xsl']) delete recipe.build.dependencies['docbook.org/xsl']
      // Remove x.org/x11 dep (not in S3)
      if (recipe.dependencies?.['x.org/x11']) delete recipe.dependencies['x.org/x11']
      if (recipe.dependencies?.['x.org/exts']) delete recipe.dependencies['x.org/exts']
      if (recipe.dependencies?.['x.org/xrender']) delete recipe.dependencies['x.org/xrender']
      if (recipe.dependencies?.['x.org/xrandr']) delete recipe.dependencies['x.org/xrandr']
      if (recipe.dependencies?.['x.org/xi']) delete recipe.dependencies['x.org/xi']
      // Remove ebassi.github.io/graphene dep (complex)
      if (recipe.dependencies?.['ebassi.github.io/graphene']) delete recipe.dependencies['ebassi.github.io/graphene']
      // Remove debian.org/iso-codes dep
      if (recipe.dependencies?.['debian.org/iso-codes']) delete recipe.dependencies['debian.org/iso-codes']
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a === '-Dintrospection=true' ? '-Dintrospection=false' : a,
        )
        // Fix --prefix quoting
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── gtk.org/gtk4 — disable introspection + remove heavy deps ────────

  'gtk.org/gtk4': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove docbook/xslt build deps
      if (recipe.build?.dependencies?.['docbook.org']) delete recipe.build.dependencies['docbook.org']
      if (recipe.build?.dependencies?.['docbook.org/xsl']) delete recipe.build.dependencies['docbook.org/xsl']
      if (recipe.build?.dependencies?.['gnome.org/libxslt']) delete recipe.build.dependencies['gnome.org/libxslt']
      // Remove sass-lang.com/sassc build dep
      if (recipe.build?.dependencies?.['sass-lang.com/sassc']) delete recipe.build.dependencies['sass-lang.com/sassc']
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
        recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled', '-Ddocumentation=false')
      }
    },
  },

  // ─── freedesktop.org/p11-kit — fix trust-paths template ─────────────

  'freedesktop.org/p11-kit': {
    modifyRecipe: (recipe: any) => {
      // Fix trust_paths: add .prefix suffix to ca-certs dep reference
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.includes('trust_paths') && !a.includes('.prefix')
            ? a.replace('{{deps.curl.se/ca-certs}}', '{{deps.curl.se/ca-certs.prefix}}')
            : a,
        )
      }
    },
  },

  // ─── freedesktop.org/polkit — disable introspection + fix prefix ─────

  'freedesktop.org/polkit': {
    modifyRecipe: (recipe: any) => {
      // Remove gobject-introspection dep (now in S3 but complex)
      if (recipe.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.dependencies['gnome.org/gobject-introspection']
      }
      // Fix --prefix quoting
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
        // Disable introspection
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=false')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=false')
        }
      }
    },
  },

  // ─── netflix.com/vmaf — fix meson prefix quoting ─────────────────────

  'netflix.com/vmaf': {
    modifyRecipe: (recipe: any) => {
      // Fix inline meson --prefix (in script string, not env)
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('meson') && step.includes('--prefix=')) {
            recipe.build.script[i] = step.replace(/--prefix={{prefix}}/, '--prefix="{{prefix}}"')
          }
        }
      }
    },
  },

  // ─── mupdf.com — fix sed -i BSD + remove linux X11/mesa deps ─────────

  'mupdf.com': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove linux X11/mesa/freeglut deps (not in S3)
      const linuxOnlyDeps = [
        'mesa3d.org',
        'freeglut.sourceforge.io',
        'freedesktop.org/mesa-glu',
        'x.org/protocol',
        'x.org/x11',
        'x.org/xcursor',
        'x.org/xinerama',
        'x.org/xrandr',
        'x.org/xtrans',
      ]
      if (recipe.dependencies?.linux) {
        for (const dep of linuxOnlyDeps) {
          if (recipe.dependencies.linux[dep]) delete recipe.dependencies.linux[dep]
        }
      }
    },
  },

  // ─── lavinmq.com — fix sed -i BSD compat ─────────────────────────────

  'lavinmq.com': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in darwin Makefile patch
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── freedesktop.org/appstream — fix sed -i BSD + disable heavy deps ─

  'freedesktop.org/appstream': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in docbook xsl path fix
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove gobject-introspection, vala, libxslt, docbook build deps
      const heavyDeps = [
        'gnome.org/gobject-introspection',
        'gnome.org/vala',
        'gnome.org/libxslt',
        'docbook.org/xsl',
        'itstool.org',
        'debian.org/bash-completion',
      ]
      for (const dep of heavyDeps) {
        if (recipe.build?.dependencies?.[dep]) delete recipe.build.dependencies[dep]
      }
      // Remove systemd.io linux dep
      if (recipe.dependencies?.linux?.['systemd.io']) {
        delete recipe.dependencies.linux['systemd.io']
      }
      // Disable introspection/vapi in meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) => {
          if (a === '-Dgir=true') return '-Dgir=false'
          if (a === '-Dvapi=true') return '-Dvapi=false'
          return a
        })
      }
      // Remove linux CC/CXX/LD override
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── fluxcd.io/flux2 — fix Go build ──────────────────────────────────

  'fluxcd.io/flux2': {
    modifyRecipe: (recipe: any) => {
      // Remove kubernetes.io/kustomize build dep (not in S3)
      if (recipe.build?.dependencies?.['kubernetes.io/kustomize']) {
        delete recipe.build.dependencies['kubernetes.io/kustomize']
      }
    },
  },

  // ─── pwmt.org/girara — simple meson build (gtk3 now fixed) ──────────

  'pwmt.org/girara': {
    // gtk3 and json-glib are now fixed — no recipe changes needed
  },

  // ─── pwmt.org/zathura — fix sed -i BSD compat ────────────────────────

  'pwmt.org/zathura': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in girara_warn rename
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
        }
      }
      // Remove gnome.org/adwaita-icon-theme dep (not in S3)
      if (recipe.dependencies?.['gnome.org/adwaita-icon-theme']) {
        delete recipe.dependencies['gnome.org/adwaita-icon-theme']
      }
      // Remove freedesktop.org/intltool dep (not in S3)
      if (recipe.dependencies?.['freedesktop.org/intltool']) {
        delete recipe.dependencies['freedesktop.org/intltool']
      }
    },
  },

  // ─── python-pillow.org — remove x.org/xcb dep ────────────────────────

  'python-pillow.org': {
    modifyRecipe: (recipe: any) => {
      // Remove x.org/xcb dep (not in S3)
      if (recipe.dependencies?.['x.org/xcb']) {
        delete recipe.dependencies['x.org/xcb']
      }
      // Remove xcb from pip install args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => a !== '-C xcb=enable',
        )
      }
    },
  },

  // ─── mergestat.com/mergestat-lite — fix Go build ─────────────────────

  'mergestat.com/mergestat-lite': {
    modifyRecipe: (recipe: any) => {
      // Remove python.org build dep (not needed for Go build)
      if (recipe.build?.dependencies?.['python.org']) {
        delete recipe.build.dependencies['python.org']
      }
    },
  },

  // ─── kubebuilder.io — remove goreleaser dep ──────────────────────────

  'kubebuilder.io': {
    modifyRecipe: (recipe: any) => {
      // Remove goreleaser.com build dep (not in S3)
      if (recipe.build?.dependencies?.['goreleaser.com']) {
        delete recipe.build.dependencies['goreleaser.com']
      }
    },
  },

  // ─── kubernetes.io/kubectl — fix make build ───────────────────────────

  'kubernetes.io/kubectl': {
    modifyRecipe: (recipe: any) => {
      // Remove rsync.samba.org build dep (not in S3)
      if (recipe.build?.dependencies?.['rsync.samba.org']) {
        delete recipe.build.dependencies['rsync.samba.org']
      }
    },
  },

  // ─── macvim.org — remove perl/ruby interp deps ───────────────────────

  'macvim.org': {
    modifyRecipe: (recipe: any) => {
      // Remove perl/ruby interp flags (complex deps)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) =>
          a !== '--enable-perlinterp' && a !== '--enable-rubyinterp' && a !== '--enable-tclinterp',
        )
      }
      // Remove ruby-lang.org dep
      if (recipe.dependencies?.['ruby-lang.org']) {
        delete recipe.dependencies['ruby-lang.org']
      }
    },
  },

  // ─── werf.io — remove linux btrfs-progs dep ──────────────────────────

  'werf.io': {
    modifyRecipe: (recipe: any) => {
      // Remove btrfs-progs dep (not in S3, optional for linux build)
      if (recipe.build?.dependencies?.linux?.['github.com/kdave/btrfs-progs']) {
        delete recipe.build.dependencies.linux['github.com/kdave/btrfs-progs']
      }
      // Remove linux gcc dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux binutils dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/binutils']) {
        delete recipe.build.dependencies.linux['gnu.org/binutils']
      }
      // Remove linux static build tags (can't static link without musl)
      if (Array.isArray(recipe.build?.env?.linux?.TAGS)) {
        recipe.build.env.linux.TAGS = recipe.build.env.linux.TAGS.filter(
          (t: string) => t !== 'static_build' && t !== 'netgo' && t !== 'osusergo',
        )
      }
      // Remove -extldflags=-static from linux LD_FLAGS
      if (Array.isArray(recipe.build?.env?.linux?.LD_FLAGS)) {
        recipe.build.env.linux.LD_FLAGS = recipe.build.env.linux.LD_FLAGS.filter(
          (f: string) => f !== '-extldflags=-static',
        )
      }
    },
  },

  // ─── pulumi.io — fix sed -i BSD compat ───────────────────────────────

  'pulumi.io': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in sdk/*/Makefile patch
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            recipe.build.script[i] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── projen.io — remove maven dep ────────────────────────────────────

  'projen.io': {
    modifyRecipe: (recipe: any) => {
      // Remove maven.apache.org build dep (not in S3)
      if (recipe.build?.dependencies?.['maven.apache.org']) {
        delete recipe.build.dependencies['maven.apache.org']
      }
    },
  },

  // ─── apache.org/zookeeper — remove cppunit dep ───────────────────────

  'apache.org/zookeeper': {
    modifyRecipe: (recipe: any) => {
      // Remove freedesktop.org/cppunit build dep (not in S3)
      if (recipe.build?.dependencies?.['freedesktop.org/cppunit']) {
        delete recipe.build.dependencies['freedesktop.org/cppunit']
      }
      // Remove linux gcc dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── epsilon-project.sourceforge.io — simple autotools ──────────────

  'epsilon-project.sourceforge.io': {
    // Simple autotools build — no changes needed beyond what's already in CI
  },

  // ─── gdal.org — fix stray cmake quote + sed -i BSD + remove llvm dep ─

  'gdal.org': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Fix sed -i BSD compat in gdal-config fixup
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove linux llvm.org build dep
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Remove linux apache.org/thrift dep (not in S3 yet)
      if (recipe.dependencies?.linux?.['apache.org/thrift']) {
        delete recipe.dependencies.linux['apache.org/thrift']
      }
      // Remove CC/CXX/LD overrides (use system compiler)
      if (recipe.build?.env?.CC === 'clang') delete recipe.build.env.CC
      if (recipe.build?.env?.CXX === 'clang++') delete recipe.build.env.CXX
      if (recipe.build?.env?.LD === 'clang') delete recipe.build.env.LD
    },
  },

  // ─── getmonero.org — remove linux llvm dep ───────────────────────────

  'getmonero.org': {
    modifyRecipe: (recipe: any) => {
      // Remove linux llvm.org build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
    },
  },

  // ─── openresty.org — fix sed -i BSD compat ───────────────────────────

  'openresty.org': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in resty script patching
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i\n/, 'sed -i.bak\n')
              .replace(/^(\s*)sed -i\s*$/m, '$1sed -i.bak')
          }
        }
      }
    },
  },

  // ─── opensearch.org — fix sed -i BSD compat ──────────────────────────

  'opensearch.org': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in multiple steps
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -e /g, 'sed -i.bak -e ')
              .replace(/sed -i -f /g, 'sed -i.bak -f ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -e /g, 'sed -i.bak -e ')
          }
        }
      }
    },
  },

  // ─── bitcoin.org — remove linux llvm/gcc dep ─────────────────────────

  'bitcoin.org': {
    modifyRecipe: (recipe: any) => {
      // Remove linux gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove capnproto.org dep (not in S3)
      if (recipe.dependencies?.['capnproto.org']) {
        delete recipe.dependencies['capnproto.org']
      }
    },
  },

  // ─── aws.amazon.com/cli — fix python version constraint ──────────────

  'aws.amazon.com/cli': {
    modifyRecipe: (recipe: any) => {
      // Widen python version constraint to include 3.12
      if (recipe.build?.dependencies?.['python.org'] === '>=3.7<3.12') {
        recipe.build.dependencies['python.org'] = '>=3.7<3.13'
      }
    },
  },

  // ─── php.net — fix sed -i BSD compat + remove kerberos dep ──────────

  'php.net': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in php-config/phpize fixup steps
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i\n/g, 'sed -i.bak\n')
              .replace(/^(\s+)sed -i$/m, '$1sed -i.bak')
          }
        }
      }
      // Remove kerberos.org dep (not in S3)
      if (recipe.dependencies?.['kerberos.org']) {
        delete recipe.dependencies['kerberos.org']
      }
      // Remove --with-kerberos from ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => a !== '--with-kerberos',
        )
      }
      // Remove gnu.org/gcc/libstdcxx dep (use system libstdc++)
      if (recipe.dependencies?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies['gnu.org/gcc/libstdcxx']
      }
    },
  },

  // ─── opendap.org — remove linux libtirpc dep ─────────────────────────

  'opendap.org': {
    modifyRecipe: (recipe: any) => {
      // Remove linux sourceforge.net/libtirpc dep (not in S3)
      if (recipe.dependencies?.linux?.['sourceforge.net/libtirpc']) {
        delete recipe.dependencies.linux['sourceforge.net/libtirpc']
      }
      // Remove linux util-linux dep
      if (recipe.dependencies?.linux?.['github.com/util-linux/util-linux']) {
        delete recipe.dependencies.linux['github.com/util-linux/util-linux']
      }
    },
  },

  // ─── open-mpi.org — fix prefix quoting + sed -i BSD ──────────────────

  'open-mpi.org': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and other args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Fix sed -i BSD compat in wrapper-data.txt fixup
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── modal.com — remove cython dep on linux/aarch64 ──────────────────

  'modal.com': {
    modifyRecipe: (recipe: any) => {
      // Remove cython.org dep on linux/aarch64 (not in S3)
      if (recipe.build?.dependencies?.['linux/aarch64']?.['cython.org']) {
        delete recipe.build.dependencies['linux/aarch64']['cython.org']
      }
    },
  },

  // ─── qemu.org — fix prefix quoting + sed -i BSD + remove vde dep ────

  'qemu.org': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Fix sed -i BSD compat in meson.build patch
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove virtualsquare.org/vde dep (not in S3)
      if (recipe.dependencies?.['virtualsquare.org/vde']) {
        delete recipe.dependencies['virtualsquare.org/vde']
      }
      // Remove --enable-vde from ARGS
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => a !== '--enable-vde',
        )
      }
    },
  },

  // ─── sfcgal.org — fix stray cmake prefix quote ───────────────────────

  'sfcgal.org': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove linux gcc/make build deps (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/make']) {
        delete recipe.build.dependencies.linux['gnu.org/make']
      }
    },
  },

  // ─── sourceforge.net/faac — fix prefix quoting + remove gcc dep ──────

  'sourceforge.net/faac': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and --libdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Remove linux gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── tcl-lang.org — remove x.org/x11 dep + fix sed -i BSD ───────────

  'tcl-lang.org': {
    modifyRecipe: (recipe: any) => {
      // Remove x.org/x11 and x.org/exts deps (not in S3)
      if (recipe.dependencies?.['x.org/x11']) delete recipe.dependencies['x.org/x11']
      if (recipe.dependencies?.['x.org/exts']) delete recipe.dependencies['x.org/exts']
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -f /g, 'sed -i.bak -f ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── virtualsquare.org/vde — fix prefix quoting ──────────────────────

  'virtualsquare.org/vde': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── tlr.dev — remove protobuf dep ───────────────────────────────────

  'tlr.dev': {
    modifyRecipe: (recipe: any) => {
      // Remove protobuf.dev build dep (not needed for Rust build)
      if (recipe.build?.dependencies?.['protobuf.dev']) {
        delete recipe.build.dependencies['protobuf.dev']
      }
    },
  },

  // ─── rucio.cern.ch/rucio-client — remove postgresql dep ──────────────

  'rucio.cern.ch/rucio-client': {
    modifyRecipe: (recipe: any) => {
      // Remove postgresql.org build dep (not in S3)
      if (recipe.build?.dependencies?.['postgresql.org']) {
        delete recipe.build.dependencies['postgresql.org']
      }
    },
  },

  // ─── x.org/xauth — fix prefix quoting + remove gcc dep ──────────────

  'x.org/xauth': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and other args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Remove linux gcc/make build deps (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/make']) {
        delete recipe.build.dependencies.linux['gnu.org/make']
      }
    },
  },

  // ─── x.org/xinput — fix prefix quoting ───────────────────────────────

  'x.org/xinput': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── freedesktop.org/shared-mime-info — fix meson prefix quoting ─────

  'freedesktop.org/shared-mime-info': {
    modifyRecipe: (recipe: any) => {
      // Fix inline meson --prefix (in script string, not env)
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('meson') && step.includes('--prefix=')
            && !step.includes('"{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/--prefix={{prefix}}/, '--prefix="{{prefix}}"')
          }
        }
      }
    },
  },

  // ─── freedesktop.org/XKeyboardConfig — fix prefix quoting ───────────

  'freedesktop.org/XKeyboardConfig': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and --libdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Remove gnome.org/libxslt build dep (not needed for data-only package)
      if (recipe.build?.dependencies?.['gnome.org/libxslt']) {
        delete recipe.build.dependencies['gnome.org/libxslt']
      }
    },
  },

  // ─── freedesktop.org/poppler-qt5 — fix cmake prefix + disable qt5/introspection ─

  'freedesktop.org/poppler-qt5': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
        // Disable Qt5 and introspection (qt.io not in S3)
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) => {
          if (a === '-DENABLE_QT5=ON') return '-DENABLE_QT5=OFF'
          if (a === '-DENABLE_GLIB=ON') return '-DENABLE_GLIB=OFF'
          if (a === '-DWITH_GObjectIntrospection=ON') return '-DWITH_GObjectIntrospection=OFF'
          return a
        })
      }
      // Remove qt.io dep (not in S3)
      if (recipe.dependencies?.['qt.io']) delete recipe.dependencies['qt.io']
      // Remove gobject-introspection build dep
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove linux llvm build dep
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Remove linux binutils build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/binutils']) {
        delete recipe.build.dependencies.linux['gnu.org/binutils']
      }
      // Remove linux gcc/g++ dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux CC/CXX/LD overrides
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── gnome.org/gtk-mac-integration-gtk3 — disable introspection ──────

  'gnome.org/gtk-mac-integration-gtk3': {
    modifyRecipe: (recipe: any) => {
      // Disable introspection in configure args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '--enable-introspection=yes' ? '--enable-introspection=no' : a,
        )
      }
      // Remove gobject-introspection and intltool build deps
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      if (recipe.build?.dependencies?.['freedesktop.org/intltool']) {
        delete recipe.build.dependencies['freedesktop.org/intltool']
      }
    },
  },

  // ─── intel.com/libva — remove x.org/x11 dep chain ────────────────────

  'intel.com/libva': {
    modifyRecipe: (recipe: any) => {
      // Remove x.org/x11 and related deps (not in S3)
      const x11Deps = ['x.org/x11', 'x.org/exts', 'x.org/xfixes']
      for (const dep of x11Deps) {
        if (recipe.dependencies?.[dep]) delete recipe.dependencies[dep]
      }
      // Disable x11 in meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '-Dwith_x11=yes' ? '-Dwith_x11=no' : a,
        )
      }
    },
  },

  // ─── apache.org/arrow — fix stray cmake prefix + sed -i BSD + remove llvm ─

  'apache.org/arrow': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Fix sed -i BSD compat in pkgconfig fixup
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove llvm.org build dep (too heavy)
      if (recipe.build?.dependencies?.['llvm.org']) {
        delete recipe.build.dependencies['llvm.org']
      }
      // Remove linux gnu.org/gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
      // Remove darwin libcxx.llvm.org dep
      if (recipe.dependencies?.darwin?.['libcxx.llvm.org']) {
        delete recipe.dependencies.darwin['libcxx.llvm.org']
      }
      // Remove linux CC/CXX/LD overrides
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
      // Remove darwin CC/CXX/LD overrides
      if (recipe.build?.env?.darwin) {
        delete recipe.build.env.darwin.CC
        delete recipe.build.env.darwin.CXX
        delete recipe.build.env.darwin.LD
      }
    },
  },

  // ─── facebook.com/wangle — remove linux gcc dep ───────────────────────

  'facebook.com/wangle': {
    modifyRecipe: (recipe: any) => {
      // Remove linux gnu.org/gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
    },
  },

  // ─── facebook.com/edencommon — fix sed -i BSD + remove gcc dep ───────

  'facebook.com/edencommon': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            recipe.build.script[i] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove linux gnu.org/gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
    },
  },

  // ─── facebook.com/fb303 — fix stray cmake prefix + remove gcc dep ────

  'facebook.com/fb303': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove linux gnu.org/gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
    },
  },

  // ─── facebook.com/fbthrift — fix stray cmake prefix + sed -i BSD + remove gcc ─

  'facebook.com/fbthrift': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -E\n/g, 'sed -i.bak -E\n')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -E\n/g, 'sed -i.bak -E\n')
          }
        }
      }
      // Remove linux gnu.org/gcc and binutils build deps
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/binutils']) {
        delete recipe.build.dependencies.linux['gnu.org/binutils']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
      // Remove linux CC/CXX/LD overrides
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── facebook.com/mvfst — fix stray cmake prefix + sed -i BSD + remove gcc ─

  'facebook.com/mvfst': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i\n/g, 'sed -i.bak\n')
              .replace(/^(\s*)sed -i$/m, '$1sed -i.bak')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove linux gnu.org/gcc, binutils, make, linux-headers build deps
      const linuxBuildDeps = ['gnu.org/gcc', 'gnu.org/binutils', 'gnu.org/make', 'kernel.org/linux-headers']
      for (const dep of linuxBuildDeps) {
        if (recipe.build?.dependencies?.linux?.[dep]) {
          delete recipe.build.dependencies.linux[dep]
        }
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
      // Remove linux CC/CXX/LD overrides
      if (recipe.build?.env?.linux) {
        delete recipe.build.env.linux.CC
        delete recipe.build.env.linux.CXX
        delete recipe.build.env.linux.LD
      }
    },
  },

  // ─── perl.org — fix IO.xs poll.h on Linux ──────────────────────────

  'perl.org': {
    platforms: {
      linux: {
        prependScript: [{
          run: [
            '# Ensure poll.h is available for IO.xs — Perl ignores $CFLAGS,',
            '# so we create a symlink or patch Configure to add -include flag',
            'if [ ! -f /usr/include/poll.h ] && [ -f /usr/include/sys/poll.h ]; then',
            '  ln -sf /usr/include/sys/poll.h /usr/include/poll.h 2>/dev/null || true',
            'fi',
            '# Also inject into Perl Configure flags',
            'export CFLAGS="$CFLAGS -D_GNU_SOURCE -include /usr/include/poll.h"',
          ].join('\n'),
        }],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove llvm.org dep on linux (use system compiler)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
      // Add -Accflags to pass poll.h include through Perl's Configure on Linux
      if (recipe.build?.env?.linux?.ARGS && Array.isArray(recipe.build.env.linux.ARGS)) {
        recipe.build.env.linux.ARGS.push('-Accflags=-D_GNU_SOURCE -Accflags=-include -Accflags=/usr/include/poll.h')
      } else if (recipe.build?.env?.ARGS && Array.isArray(recipe.build.env.ARGS)) {
        // If no linux-specific ARGS, add to the general list
        if (!recipe.build.env.linux) recipe.build.env.linux = {}
        recipe.build.env.linux.ARGS = ['-Accflags=-D_GNU_SOURCE -Accflags=-include -Accflags=/usr/include/poll.h']
      }
    },
  },
}
