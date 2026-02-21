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
      // Add tinfo.pc → tinfow.pc symlink on linux
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script.push({
          run: 'ln -s tinfow.pc tinfo.pc',
          if: 'linux',
          'working-directory': '${{prefix}}/lib/pkgconfig',
        })
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
            'SQLITE="$(ldd libsoup-*.so | sed -n \'/libsqlite3.so/s/=>.*//p\')"',
            'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so libsoup-*.so',
          ].join('\n'),
          'working-directory': '{{prefix}}/lib',
          if: 'linux',
        })
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
}
