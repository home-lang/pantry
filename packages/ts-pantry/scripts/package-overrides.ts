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
  modifyRecipe?: (recipe: any, platform?: string) => void
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
    '# Ensure aclocal can find libtool M4 macros (needed for autoreconf)',
    'BREW_LT_SHARE="$(brew --prefix libtool 2>/dev/null)/share/aclocal"',
    'if [ -d "$BREW_LT_SHARE" ]; then',
    '  export ACLOCAL_PATH="${BREW_LT_SHARE}${ACLOCAL_PATH:+:$ACLOCAL_PATH}"',
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
    platforms: {
      darwin: {
        // Install boost from Homebrew. Boost 1.82+ made regex header-only,
        // but source-highlight's configure expects a compiled libboost_regex.
        // AX_BOOST_REGEX searches --with-boost-libdir for libboost_regex* files.
        // Create stub dylib there so the file search succeeds.
        prependScript: [
          'brew install boost 2>/dev/null || true',
          'brew link boost --overwrite 2>/dev/null || true',
          'BOOST_PREFIX=$(brew --prefix boost)',
          // Create stub libboost_regex.dylib — Boost 1.82+ made regex header-only
          // so no compiled library exists. AX_BOOST_REGEX needs a file to find.
          'BOOST_STUB_DIR=/tmp/boost-regex-stub',
          'mkdir -p "$BOOST_STUB_DIR"',
          'echo "void _boost_regex_stub(void){}" > /tmp/_br.c && cc -dynamiclib -o "$BOOST_STUB_DIR/libboost_regex.dylib" /tmp/_br.c && rm -f /tmp/_br.c',
          'export LDFLAGS="-L$BOOST_STUB_DIR -L${BOOST_PREFIX}/lib $LDFLAGS"',
          'export CPPFLAGS="-I${BOOST_PREFIX}/include $CPPFLAGS"',
          // Tell AX_BOOST_REGEX where to find the stub library file (darwin only)
          'export ARGS="$ARGS --with-boost-libdir=/tmp/boost-regex-stub"',
        ],
      },
      linux: {
        // Install boost Regex from apt
        prependScript: [
          'sudo apt-get install -y libboost-regex-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove boost.org S3 dep — use system-installed boost instead
      if (recipe.dependencies?.['boost.org']) {
        delete recipe.dependencies['boost.org']
      }
      // Replace --with-boost=<S3 path> — on darwin we use brew, on linux we use apt
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => !a.startsWith('--with-boost='),
        )
        // Boost 1.82+ made regex header-only. Pass cache var to skip link test.
        recipe.build.env.ARGS.push('ax_cv_boost_regex=yes')
      }
    },
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
    platforms: {
      darwin: {
        // Install libpsl from Homebrew for cookie domain security
        prependScript: [
          'brew install libpsl 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix libpsl)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        // Install libpsl from apt for cookie domain security
        prependScript: [
          'sudo apt-get install -y libpsl-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove S3 libpsl dep — use system-installed libpsl instead
      if (recipe.dependencies?.['rockdaboot.github.io/libpsl']) {
        delete recipe.dependencies['rockdaboot.github.io/libpsl']
      }
      // Fix configure args
      if (recipe.build?.env) {
        const args = recipe.build.env.ARGS || recipe.build.env.linux?.ARGS || recipe.build.env.darwin?.ARGS
        if (Array.isArray(args)) {
          // Remove the broken --without-libps1 typo
          const idx = args.indexOf('--without-libps1')
          if (idx >= 0) args.splice(idx, 1)
          // Remove --without-libpsl too — we have it now from system packages
          const idx2 = args.indexOf('--without-libpsl')
          if (idx2 >= 0) args.splice(idx2, 1)
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
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
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
      // v4.0.0+ switched from autotools to meson — replace build script
      recipe.build.script = [
        'meson setup build --prefix="$PREFIX" --libdir="$PREFIX/lib" --buildtype=release --wrap-mode=nofallback',
        'meson compile -C build --verbose',
        'meson install -C build',
      ]
      if (!recipe.build.dependencies) recipe.build.dependencies = {}
      recipe.build.dependencies['mesonbuild.com'] = '*'
      recipe.build.dependencies['ninja-build.org'] = '*'
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
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
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
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
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
    platforms: {
      darwin: {
        // Install ICU from Homebrew for Unicode collation support
        prependScript: [
          'brew install icu4c 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix icu4c)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        // Install ICU from apt for Unicode collation support
        prependScript: [
          'sudo apt-get install -y libicu-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove unicode.org dep from S3 — use system ICU instead
      if (recipe.dependencies?.['unicode.org']) delete recipe.dependencies['unicode.org']
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

  // ─── lloyd.github.io/yajl — fix deprecated cmake policy ────────────────
  // yajl 2.1.0 uses cmake_policy(SET CMP0026 OLD) which is removed in cmake 3.20+.
  'lloyd.github.io/yajl': {
    prependScript: [
      'sed -i.bak "/cmake_policy.*CMP0026/d" CMakeLists.txt 2>/dev/null || true',
    ],
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
    modifyRecipe: (recipe: any, platform?: string) => {
      // Remove gobject-introspection build dep (circular dep chain)
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Remove gnome.org/libxml2 build dep on linux (not in S3 for linux).
      // On darwin, KEEP it — gettext from S3 has hardcoded libxml2.16.dylib path
      // and DYLD_FALLBACK_LIBRARY_PATH needs gnome.org/libxml2 in deps to find it.
      if (platform?.startsWith('linux') && recipe.build?.dependencies?.['gnome.org/libxml2']) {
        delete recipe.build.dependencies['gnome.org/libxml2']
      }
      // Relax python version constraint (S3 has 3.14, YAML wants >=3.5<3.12)
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '3'
      }
      // Disable introspection in meson args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => !a.includes('introspection'))
        recipe.build.env.ARGS.push('-Dintrospection=disabled')
      }
      // Fix sed -i calls in build script (BSD requires suffix)
      // Also fix the meson python path sed: YAML parser splits the multi-line plain scalar
      // into separate lines, detaching file args from the sed command.
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            if (step.run.includes('sed -i -e')) {
              step.run = step.run.replace(/sed -i -e /g, 'sed -i.bak -e ')
            }
            // Fix meson python path sed: join newline-split file args, make non-fatal
            // (files may not exist if build config changes, e.g. introspection disabled)
            if (step.run.includes('mesonbuild.com') && step.run.includes('python')) {
              // YAML parser strips indentation, leaving bare \n between file args
              step.run = step.run.replace(/\n\s*/g, ' ')
              // Append || true so missing files (from disabled introspection) don't fail the build
              if (!step.run.includes('|| true')) {
                step.run = `${step.run.trimEnd()} || true`
              }
            }
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
      // Note: doc_xml_dtd removed — not a valid option in newer dbus versions
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        for (const flag of ['-Ddoxygen_docs=disabled', '-Dxml_docs=disabled']) {
          if (!recipe.build.env.MESON_ARGS.includes(flag)) {
            recipe.build.env.MESON_ARGS.push(flag)
          }
        }
        // Remove any stale doc_xml_dtd options that might already be in ARGS
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.filter(
          (a: string) => !a.includes('doc_xml_dtd'),
        )
      }
    },
  },

  // ─── x.org/protocol — fix version format in URL ────────────────────────────
  // The YAML uses version.raw but the tarball uses 2-part version (e.g. 2025.1 not 2025.1.0).
  // version.marketing gives "2025.1" for version "2025.1.0" which matches the actual filename.
  'x.org/protocol': {
    distributableUrl: 'https://xorg.freedesktop.org/archive/individual/proto/xorgproto-{{version.marketing}}.tar.gz',
  },

  // ─── x.org/libpthread-stubs — use xorg.freedesktop.org mirror ─────────────
  // The YAML uses www.x.org which has intermittent connectivity issues from CI.
  // xorg.freedesktop.org is a more reliable mirror for GitHub Actions runners.
  'x.org/libpthread-stubs': {
    distributableUrl: 'https://xorg.freedesktop.org/archive/individual/xcb/libpthread-stubs-{{version.marketing}}.tar.gz',
  },

  // ─── x.org/xdmcp — fix sed -i BSD compat ──────────────────────────────
  'x.org/xdmcp': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat: the build script does `sed -i 's/...' *.la`
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── x.org/xcb — fix $SHELF variable references ──────────────────────────
  'x.org/xcb': {
    modifyRecipe: (recipe: any) => {
      // Fix $SHELF in ARGS array (same pattern as x.org/ice)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/"\$SHELF"\/etc/, '"{{prefix}}/etc"')
           .replace(/"\$SHELF"\/var/, '"{{prefix}}/var"'),
        )
      }
      // Remove python.org build dep (uses ~3.11 constraint, S3 has 3.14+)
      // System python3 is sufficient for xcb-proto parsing
      if (recipe.build?.dependencies?.['python.org']) {
        delete recipe.build.dependencies['python.org']
      }
    },
  },

  // ─── x.org/protocol/xcb — relax python version + fix module path ─────────
  'x.org/protocol/xcb': {
    modifyRecipe: (recipe: any) => {
      // Relax python version constraint (S3 has 3.14, YAML wants ~3.11)
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '3'
      }
      if (recipe.test?.dependencies?.['python.org']) {
        recipe.test.dependencies['python.org'] = '3'
      }
      // After make install, create python3.11 compat symlink for the hardcoded
      // runtime PYTHONPATH (${{prefix}}/lib/python3.11/site-packages)
      if (typeof recipe.build?.script === 'string') {
        recipe.build.script += [
          '',
          '# Create python3.11 compat symlink for hardcoded PYTHONPATH',
          'PY_VER=$(python3 -c "import sys; print(f\'{sys.version_info.major}.{sys.version_info.minor}\')")',
          'if [ "$PY_VER" != "3.11" ] && [ -d "{{prefix}}/lib/python$PY_VER" ]; then',
          '  ln -sfn "python$PY_VER" "{{prefix}}/lib/python3.11"',
          'fi',
        ].join('\n')
      }
    },
  },

  // xcb.freedesktop.org → xorg.freedesktop.org mirror is handled generically
  // in applyRecipeOverrides (build-package.ts), no per-package overrides needed.

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
    platforms: {
      darwin: {
        // Install HDF5 from Homebrew for MATLAB v7.3 file support
        prependScript: [
          'brew install hdf5 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix hdf5)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix hdf5)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix hdf5)/include $CPPFLAGS"',
        ],
      },
      linux: {
        // Install HDF5 from apt for MATLAB v7.3 file support
        prependScript: [
          'sudo apt-get install -y libhdf5-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove S3 HDF5 dep — use system-installed HDF5 instead
      if (recipe.dependencies?.['hdfgroup.org/HDF5']) {
        delete recipe.dependencies['hdfgroup.org/HDF5']
      }
      // Remove darwin llvm.org build dep
      if (recipe.build?.dependencies?.darwin?.['llvm.org']) {
        delete recipe.build.dependencies.darwin['llvm.org']
      }
      // Fix cmake prefix quote issue
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
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
      // Replace hw.concurrency with 1 to prevent OOM during LTO link phase
      // Use regex to handle both {{hw.concurrency}} and {{ hw.concurrency }} (with spaces)
      const hwConcurrencyRe = /\{\{\s*hw\.concurrency\s*\}\}/g
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('make')) {
            recipe.build.script[i] = step.replace(hwConcurrencyRe, '1')
          } else if (typeof step === 'object' && typeof step.run === 'string'
            && step.run.includes('make')) {
            step.run = step.run.replace(hwConcurrencyRe, '1')
          }
        }
      }
      // Also reduce parallel jobs in bootstrap args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(hwConcurrencyRe, '1'),
        )
      }
      // On darwin, bzip2 is not in S3 and macOS SIP prevents /usr/lib symlinks.
      // Remove BZIP2 cmake args — cmake will use its bundled bzip2 if system one isn't found
      if (Array.isArray(recipe.build?.env?.darwin?.ARGS)) {
        recipe.build.env.darwin.ARGS = recipe.build.env.darwin.ARGS.filter(
          (a: string) => !a.includes('BZIP2_LIBRARIES') && !a.includes('BZIP2_INCLUDE_DIR'),
        )
      }
      // Remove --system-bzip2 from ARGS (let cmake auto-detect)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => a !== '--system-bzip2' && a !== '--no-system-bzip2',
        )
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

  // ─── pcre.org — switch from unreliable SourceForge mirror to Exim mirror ──
  // The YAML uses cytranet.dl.sourceforge.net which is a specific SF mirror that
  // frequently goes offline. The Exim mirror at ftp.exim.org is maintained by the
  // PCRE author (Philip Hazel) and is the most reliable source for PCRE1.
  // version.marketing gives "8.45" for version "8.45.0" (tarball uses 2-part version)
  'pcre.org': {
    distributableUrl: 'https://ftp.exim.org/pub/pcre/pcre-{{version.marketing}}.tar.bz2',
  },

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
      // macOS ships bison 2.3 but doxygen requires >=2.7; add gnu.org/bison build dep
      if (!recipe.build) recipe.build = {}
      if (!recipe.build.dependencies) recipe.build.dependencies = {}
      recipe.build.dependencies['gnu.org/bison'] = '>=2.7'
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
    platforms: {
      linux: {
        prependScript: [
          // Ensure ncurses dev libs are available for configure tlib check
          'sudo apt-get install -y libncursesw5-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove perl/ruby interpreters (complex deps) — keep python/lua/ncurses
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) =>
          a !== '--enable-perlinterp' && a !== '--enable-rubyinterp',
        )
      }
      // Fix tlib on linux — system ncurses at /usr may not have tinfow, use ncurses
      if (Array.isArray(recipe.build?.env?.linux?.ARGS)) {
        recipe.build.env.linux.ARGS = recipe.build.env.linux.ARGS.map(
          (a: string) => a === '--with-tlib=tinfow' ? '--with-tlib=ncurses' : a,
        )
      }
      // Remove perl.org and ruby-lang.org runtime deps
      if (recipe.dependencies?.['perl.org']) delete recipe.dependencies['perl.org']
      if (recipe.dependencies?.['ruby-lang.org']) delete recipe.dependencies['ruby-lang.org']
    },
  },

  // ─── gnome.org/gobject-introspection — fix sed -i BSD + CC ──────────

  'gnome.org/gobject-introspection': {
    platforms: {
      darwin: {
        // macOS /usr/bin/bison is too old (v2.3), gobject-introspection needs GNU bison 3+
        prependScript: [
          'brew install bison 2>/dev/null || true; export PATH="/opt/homebrew/opt/bison/bin:$PATH"',
        ],
      },
    },
    modifyRecipe: (recipe: any, platform?: string) => {
      // Fix sed -i BSD compat and replace python dep template references
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            // Replace the sed step that uses {{deps.python.org.prefix}} with a generic version
            if (step.run.includes('deps.python.org.prefix')) {
              step.run = "sed -i.bak 's|env .*/bin/python[23]*|env python3|' g-ir-annotation-tool g-ir-scanner 2>/dev/null || true"
            }
            // Fix sed -i BSD compat in other steps
            if (step.run.includes('sed -i') && step.run.includes('g-ir-scanner')
              && !step.run.includes('sed -i.bak')) {
              step.run = step.run.replace(/sed -i /, 'sed -i.bak ')
            }
          }
          // Python 3.12+ removed distutils from stdlib. g-ir-scanner imports
          // distutils.cygwinccompiler (Windows/Cygwin only). Meson generates
          // build/giscanner/utils.py via configure_file(), so patch the build
          // dir copy AFTER meson setup but BEFORE ninja build.
          if (platform?.startsWith('darwin') && typeof step === 'string' && step.startsWith('ninja')) {
            // Comment out ALL lines referencing distutils.cygwinccompiler (import + usage)
            recipe.build.script.splice(i, 0,
              'sed -i.bak "/distutils\\.cygwinccompiler/s/^/# /" giscanner/utils.py 2>/dev/null || true',
            )
            i++ // skip the newly inserted step
          }
        }
      }
      // Remove hardcoded CC: clang (let build system choose)
      if (recipe.build?.env?.CC === 'clang') {
        delete recipe.build.env.CC
      }
      // Remove python.org dep — use system python3 to avoid broken meson python path detection
      // (S3 python 3.14 doesn't match the >=3<3.12 constraint and causes meson path issues)
      if (recipe.dependencies?.['python.org']) {
        delete recipe.dependencies['python.org']
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
      // ATK's meson declares introspection as boolean (true/false), not feature (enabled/disabled)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => !a.includes('introspection'))
        recipe.build.env.ARGS.push('-Dintrospection=false')
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
      // gsettings declares introspection as boolean (true/false), not feature (enabled/disabled)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) => !a.includes('introspection'))
        recipe.build.env.ARGS.push('-Dintrospection=false')
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

  // ─── ffmpeg.org — install codec deps from system packages + headless ──

  'ffmpeg.org': {
    platforms: {
      darwin: {
        // Install codec libraries from Homebrew so ffmpeg links against them
        prependScript: [
          'brew install x264 x265 libvpx opus webp 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix x264)/lib/pkgconfig:$(brew --prefix x265)/lib/pkgconfig:$(brew --prefix libvpx)/lib/pkgconfig:$(brew --prefix opus)/lib/pkgconfig:$(brew --prefix webp)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        // Install codec libraries from apt so ffmpeg links against them
        prependScript: [
          'sudo apt-get install -y libx264-dev libx265-dev libvpx-dev libopus-dev libwebp-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove libsdl.org dep (not needed for headless CI builds)
      if (recipe.dependencies?.['libsdl.org']) {
        delete recipe.dependencies['libsdl.org']
      }
      // Remove S3 deps for codecs — use system-installed packages instead
      if (recipe.dependencies?.['videolan.org/x264']) delete recipe.dependencies['videolan.org/x264']
      if (recipe.dependencies?.['videolan.org/x265']) delete recipe.dependencies['videolan.org/x265']
      if (recipe.dependencies?.['webmproject.org/libvpx']) delete recipe.dependencies['webmproject.org/libvpx']
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        // Add --disable-sdl2 for headless CI builds
        if (!recipe.build.env.ARGS.includes('--disable-sdl2')) {
          recipe.build.env.ARGS.push('--disable-sdl2')
        }
        // Disable doc build — fate.txt generation fails on darwin CI
        if (!recipe.build.env.ARGS.includes('--disable-doc')) {
          recipe.build.env.ARGS.push('--disable-doc')
        }
      }
    },
  },

  // ─── gnutls.org — remove p11-kit dep (not in S3) ────────────────────

  'gnutls.org': {
    platforms: {
      darwin: {
        // Install p11-kit from Homebrew for PKCS#11 trust module support
        prependScript: [
          'brew install p11-kit nettle 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix p11-kit)/lib/pkgconfig:$(brew --prefix nettle)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        // Install p11-kit from apt; build nettle 3.10 from source (Ubuntu's nettle is too old for gnutls 3.8.x)
        prependScript: [
          'sudo apt-get install -y libp11-kit-dev libgmp-dev 2>/dev/null || true',
          'NETTLE_VER=$(pkg-config --modversion nettle 2>/dev/null || echo "0"); if [ "$(printf "%s\\n3.10\\n" "$NETTLE_VER" | sort -V | head -1)" != "3.10" ]; then (cd /tmp && curl -fsSL https://ftp.gnu.org/gnu/nettle/nettle-3.10.1.tar.gz | tar xz && cd nettle-3.10.1 && ./configure --prefix=/usr/local --disable-documentation && make -j$(nproc) && sudo make install && sudo ldconfig && rm -rf /tmp/nettle-3.10.1); fi',
          'export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:/usr/local/lib64/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L/usr/local/lib -L/usr/local/lib64 $LDFLAGS"',
          'export CPPFLAGS="-I/usr/local/include $CPPFLAGS"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove S3 p11-kit dep — use system-installed p11-kit instead
      if (recipe.dependencies?.['freedesktop.org/p11-kit']) {
        delete recipe.dependencies['freedesktop.org/p11-kit']
      }
      // Remove S3 nettle dep — use brew (darwin) or build from source (linux)
      if (recipe.dependencies?.['gnu.org/nettle']) {
        delete recipe.dependencies['gnu.org/nettle']
      }
      // Remove S3 libunistring dep — use gnutls's bundled copy instead
      if (recipe.dependencies?.['gnu.org/libunistring']) {
        delete recipe.dependencies['gnu.org/libunistring']
      }
      // Use bundled libunistring (not in S3, not reliably on system)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--with-included-unistring')
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
    platforms: {
      darwin: {
        prependScript: [
          // Install bdw-gc from Homebrew since S3 binary may not have proper pkg-config
          'brew install bdw-gc libunistring 2>/dev/null || true',
        ],
      },
      linux: {
        prependScript: [
          // Install libunistring and libgc from apt since S3 binaries may be missing
          'sudo apt-get install -y libgc-dev libunistring-dev 2>/dev/null || true',
        ],
      },
    },
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
      // Fix scmconfig.h circular dependency: split "make install" into "make" + "make install"
      // The Makefile's gen-scmconfig target needs scmconfig.h which doesn't exist yet when
      // make install runs both build and install in one pass. Splitting ensures build completes first.
      const hwConcRe = /\{\{\s*hw\.concurrency\s*\}\}/g
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('make') && step.includes('install')) {
            // Replace with two steps: build first, then install (both single-threaded)
            const buildStep = 'make --jobs 1'
            const installStep = step.replace(hwConcRe, '1')
            recipe.build.script.splice(i, 1, buildStep, installStep)
            i++ // skip the newly inserted install step
          } else if (typeof step === 'string' && step.includes('make')) {
            recipe.build.script[i] = step.replace(hwConcRe, '1')
          }
        }
      }
      // Remove deps not reliably in S3 — use system packages instead
      if (recipe.dependencies?.['hboehm.info/gc']) delete recipe.dependencies['hboehm.info/gc']
      if (recipe.dependencies?.['gnu.org/libunistring']) delete recipe.dependencies['gnu.org/libunistring']
    },
  },

  // ─── gnu.org/groff — remove heavy deps not in S3 ──────────────────────

  'gnu.org/groff': {
    platforms: {
      darwin: {
        // Install uchardet from Homebrew for encoding auto-detection
        prependScript: [
          'brew install uchardet 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix uchardet)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        // Install uchardet from apt for encoding auto-detection
        prependScript: [
          'sudo apt-get install -y libuchardet-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove ghostscript.com dep (in knownBrokenDomains — tag format unresolvable)
      if (recipe.dependencies?.['ghostscript.com']) delete recipe.dependencies['ghostscript.com']
      // Remove netpbm dep (not essential for groff core functionality)
      if (recipe.dependencies?.['netpbm.sourceforge.net']) delete recipe.dependencies['netpbm.sourceforge.net']
      // Remove psutils dep (not essential for groff core functionality)
      if (recipe.dependencies?.['github.com/rrthomas/psutils']) delete recipe.dependencies['github.com/rrthomas/psutils']
      // Remove S3 uchardet dep — use system-installed uchardet instead
      if (recipe.dependencies?.['freedesktop.org/uchardet']) delete recipe.dependencies['freedesktop.org/uchardet']
      // Remove linux gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) delete recipe.build.dependencies.linux['gnu.org/gcc']
      // Fix post-install sed commands that use $PKGX_DIR — when PKGX_DIR is empty/unset,
      // sed gets an empty first RE causing "first RE may not be empty" error on macOS
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('$PKGX_DIR')) {
            // Guard the sed commands: only run if PKGX_DIR is set and non-empty
            step.run = `if [ -n "\${PKGX_DIR:-}" ]; then\n${step.run}\nfi`
          }
        }
      }
    },
  },

  // ─── gnu.org/emacs — remove heavy deps + fix post-install ────────────

  'gnu.org/emacs': {
    platforms: {
      darwin: {
        // Set deployment target to 12 to prevent using posix_spawn_file_actions_addchdir (macOS 13.4+)
        // Install gnutls + texinfo from Homebrew (S3 gnutls may not be available)
        prependScript: [
          'export MACOSX_DEPLOYMENT_TARGET=12.0',
          'brew install gnutls texinfo 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix gnutls)/lib/pkgconfig:$(brew --prefix nettle)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix gnutls)/lib -L$(brew --prefix nettle)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix gnutls)/include -I$(brew --prefix nettle)/include $CPPFLAGS"',
        ],
      },
      linux: {
        // Install gnutls + texinfo from apt
        prependScript: [
          'sudo apt-get install -y libgnutls28-dev texinfo 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove S3 gnutls dep — use system-installed gnutls instead
      if (recipe.dependencies?.['gnutls.org']) delete recipe.dependencies['gnutls.org']
      // Remove texinfo build dep — use system-installed texinfo
      if (recipe.dependencies?.['gnu.org/texinfo']) delete recipe.dependencies['gnu.org/texinfo']
      // Tell configure that posix_spawn_file_actions_addchdir is not available
      // (avoids runtime symbol lookup failure on some macOS versions)
      if (!recipe.build.env.darwin) recipe.build.env.darwin = {}
      if (!recipe.build.env.darwin.CFLAGS) recipe.build.env.darwin.CFLAGS = ''
      recipe.build.env.darwin.ac_cv_func_posix_spawn_file_actions_addchdir = 'no'
    },
  },

  // ─── gnuplot.info — remove libavif dep (not in S3) ───────────────────

  'gnuplot.info': {
    modifyRecipe: (recipe: any) => {
      // Remove linux-only libavif dep (not in S3)
      if (recipe.dependencies?.linux?.['github.com/AOMediaCodec/libavif']) {
        delete recipe.dependencies.linux['github.com/AOMediaCodec/libavif']
      }
      // Disable Lua support — gnuplot-tikz.lua has Lua 5.4 incompatibility
      // (attempt to assign to const variable 'w' at line 2546)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--without-lua')
      }
      // Remove lua.org dep since we disabled it
      if (recipe.dependencies?.['lua.org']) delete recipe.dependencies['lua.org']
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

  // ─── fukuchi.org/qrencode — fix glibtoolize not found on darwin ───────

  'fukuchi.org/qrencode': {
    platforms: {
      darwin: {
        // autogen.sh calls glibtoolize (Homebrew naming) but S3 libtool provides libtoolize
        prependScript: [
          'if command -v libtoolize >/dev/null 2>&1 && ! command -v glibtoolize >/dev/null 2>&1; then ln -sf "$(command -v libtoolize)" "$(dirname "$(command -v libtoolize)")/glibtoolize"; fi',
        ],
      },
    },
  },

  // ─── gnome.org/PyGObject — fix prefix quoting ────────────────────────

  'gnome.org/PyGObject': {
    platforms: {
      darwin: {
        // Install cairo + setuptools (distutils removed in Python 3.12+) from system
        prependScript: [
          'brew install cairo 2>/dev/null || true',
          'pip3 install setuptools 2>/dev/null || python3 -m pip install setuptools 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix cairo)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export CPPFLAGS="-I$(brew --prefix cairo)/include/cairo $CPPFLAGS"',
        ],
      },
      linux: {
        // Install cairo dev headers for gobject-introspection-tests subproject
        prependScript: [
          'sudo apt-get install -y libcairo2-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix --prefix arg: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Disable pycairo — buildkit can't set PYTHONPATH for Python dep modules at build time
      // Replace -Dpycairo=enabled with -Dpycairo=disabled (avoid duplicate flags)
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a === '-Dpycairo=enabled' ? '-Dpycairo=disabled' : a,
        )
        // Disable tests that require cairo.h from pycairo
        recipe.build.env.MESON_ARGS.push('-Dtests=false')
      }
      // Remove pycairo dep but keep cairographics.org for cairo.h
      if (recipe.dependencies?.['cairographics.org/pycairo']) {
        delete recipe.dependencies['cairographics.org/pycairo']
        recipe.dependencies['cairographics.org'] = '*'
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
    // Set SRCROOT so post-install dylib copy step can find build artifacts
    prependScript: ['export SRCROOT="$PWD"'],
    platforms: {
      darwin: {
        // Install openjpeg headers on macOS (not reliably in S3 dep tree)
        // Must also set CPPFLAGS since openjpeg installs to a versioned subdir
        prependScript: [
          'brew install openjpeg 2>/dev/null || true',
          'OJ_INC=$(find $(brew --prefix openjpeg)/include -maxdepth 1 -name "openjpeg-*" -type d | head -1); if [ -n "$OJ_INC" ]; then export CPPFLAGS="-I$OJ_INC $CPPFLAGS"; fi',
          'export LDFLAGS="-L$(brew --prefix openjpeg)/lib $LDFLAGS"',
        ],
      },
    },
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

  // ─── openssh.com — remove deps not in S3 ──────────────────────────────

  'openssh.com': {
    platforms: {
      darwin: {
        // Install kerberos, libfido2, ldns from Homebrew so openssh has full feature set
        prependScript: [
          'brew install krb5 libfido2 ldns 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix krb5)/lib/pkgconfig:$(brew --prefix libfido2)/lib/pkgconfig:$(brew --prefix ldns)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix krb5)/lib -L$(brew --prefix libfido2)/lib -L$(brew --prefix ldns)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix krb5)/include -I$(brew --prefix libfido2)/include -I$(brew --prefix ldns)/include $CPPFLAGS"',
        ],
      },
      linux: {
        // Install kerberos, libfido2, ldns from apt so openssh has full feature set
        prependScript: [
          'sudo apt-get install -y libkrb5-dev libfido2-dev libldns-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove S3 deps — use system-installed packages instead
      if (recipe.dependencies?.['nlnetlabs.nl/ldns']) delete recipe.dependencies['nlnetlabs.nl/ldns']
      if (recipe.dependencies?.['developers.yubico.com/libfido2']) delete recipe.dependencies['developers.yubico.com/libfido2']
      if (recipe.dependencies?.['kerberos.org']) delete recipe.dependencies['kerberos.org']
      // Remove linux gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) delete recipe.build.dependencies.linux['gnu.org/gcc']
    },
  },

  // ─── macvim.org — remove perl/ruby interp deps ───────────────────────

  'macvim.org': {
    modifyRecipe: (recipe: any) => {
      // Remove perl/ruby/python3 interp flags (complex deps, Python.h missing on CI)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) =>
          a !== '--enable-perlinterp' && a !== '--enable-rubyinterp' && a !== '--enable-tclinterp'
          && a !== '--enable-python3interp',
        )
        recipe.build.env.ARGS.push('--disable-python3interp')
        // Prevent configure from auto-detecting Python3 even with --disable
        recipe.build.env.ARGS.push('vi_cv_path_python3=no')
      }
      // Remove ruby-lang.org dep
      if (recipe.dependencies?.['ruby-lang.org']) {
        delete recipe.dependencies['ruby-lang.org']
      }
      // Remove python.org dep (not needed without python3interp)
      if (recipe.dependencies?.['python.org']) {
        delete recipe.dependencies['python.org']
      }
      // Also check for versioned python dep
      for (const key of Object.keys(recipe.dependencies || {})) {
        if (key.startsWith('python.org')) {
          delete recipe.dependencies[key]
        }
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
    platforms: {
      darwin: {
        // Install kerberos and ICU from Homebrew (not reliably in S3)
        prependScript: [
          'brew install krb5 icu4c 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix krb5)/lib/pkgconfig:$(brew --prefix icu4c)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix icu4c)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix icu4c)/include $CPPFLAGS"',
        ],
      },
      linux: {
        // Install kerberos, ICU, and iconv headers from apt
        prependScript: [
          'sudo apt-get install -y libkrb5-dev libicu-dev libc6-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in php-config/phpize fixup steps
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            recipe.build.script[i] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
      // Remove S3 kerberos.org dep — use system-installed kerberos instead
      if (recipe.dependencies?.['kerberos.org']) {
        delete recipe.dependencies['kerberos.org']
      }
      // Remove S3 ICU dep — use system-installed ICU instead
      if (recipe.dependencies?.['unicode.org']) {
        delete recipe.dependencies['unicode.org']
      }
      // Remove S3 libiconv dep — glibc provides iconv on linux, brew has it on darwin
      if (recipe.dependencies?.['gnu.org/libiconv']) {
        delete recipe.dependencies['gnu.org/libiconv']
      }
      // Fix --with-iconv: on linux glibc provides iconv in libc, so use autodetection
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.match(/^--with-iconv=/) ? '--with-iconv' : a,
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
    platforms: {
      darwin: {
        prependScript: [
          // Install hwloc, libevent, pmix deps from Homebrew
          'brew install hwloc libevent open-mpi/open-mpi/pmix 2>/dev/null || brew install hwloc libevent pmix 2>/dev/null || true',
          'export OMPI_HWLOC_PREFIX=$(brew --prefix hwloc)',
          'export OMPI_LIBEVENT_PREFIX=$(brew --prefix libevent)',
          'export OMPI_PMIX_PREFIX=$(brew --prefix pmix 2>/dev/null || echo /usr/local)',
          'export PKG_CONFIG_PATH="${OMPI_HWLOC_PREFIX}/lib/pkgconfig:${OMPI_LIBEVENT_PREFIX}/lib/pkgconfig:${OMPI_PMIX_PREFIX}/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L${OMPI_HWLOC_PREFIX}/lib -L${OMPI_LIBEVENT_PREFIX}/lib -L${OMPI_PMIX_PREFIX}/lib $LDFLAGS"',
          'export CPPFLAGS="-I${OMPI_HWLOC_PREFIX}/include -I${OMPI_LIBEVENT_PREFIX}/include -I${OMPI_PMIX_PREFIX}/include $CPPFLAGS"',
          // Re-export CONFIGURE_ARGS with actual paths — env vars in CONFIGURE_ARGS expand
          // to empty at assignment time because env section runs before prependScript.
          'export CONFIGURE_ARGS=$(echo "$CONFIGURE_ARGS" | sed "s|--with-hwloc=[^ ]*|--with-hwloc=${OMPI_HWLOC_PREFIX}|g; s|--with-libevent=[^ ]*|--with-libevent=${OMPI_LIBEVENT_PREFIX}|g; s|--with-pmix[^ ]*|--with-pmix=${OMPI_PMIX_PREFIX}|g")',
        ],
      },
      linux: {
        prependScript: [
          // Install hwloc, libevent, pmix dev packages from apt
          'sudo apt-get install -y libhwloc-dev libevent-dev libpmix-dev 2>/dev/null || true',
          // Set prefix vars for configure (same as darwin but /usr on linux)
          'export OMPI_HWLOC_PREFIX=/usr',
          'export OMPI_LIBEVENT_PREFIX=/usr',
          // Add multiarch pkg-config path so configure finds hwloc
          'export PKG_CONFIG_PATH="/usr/lib/x86_64-linux-gnu/pkgconfig:${PKG_CONFIG_PATH:-}"',
          // Symlink multiarch libs so configure finds them at /usr/lib
          'HWLOC_LIB=$(find /usr/lib -name "libhwloc.so" -print -quit 2>/dev/null); if [ -n "$HWLOC_LIB" ] && [ ! -f /usr/lib/libhwloc.so ]; then sudo ln -sf "$HWLOC_LIB" /usr/lib/libhwloc.so 2>/dev/null || true; fi',
          'LIBEVENT_LIB=$(find /usr/lib -name "libevent.so" -print -quit 2>/dev/null); if [ -n "$LIBEVENT_LIB" ] && [ ! -f /usr/lib/libevent.so ]; then sudo ln -sf "$LIBEVENT_LIB" /usr/lib/libevent.so 2>/dev/null || true; fi',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and other args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) =>
          a.replace(/^(--\w[\w-]+=)"([^"]+)"$/, '$1$2'),
        )
        // Replace hardcoded /usr paths with env var references (expanded at shell time)
        // On darwin: $OMPI_HWLOC_PREFIX → brew prefix; on linux: $OMPI_HWLOC_PREFIX → /usr
        recipe.build.env.CONFIGURE_ARGS = recipe.build.env.CONFIGURE_ARGS.map((a: string) => {
          if (a.match(/^--with-hwloc=/)) return '--with-hwloc=$OMPI_HWLOC_PREFIX'
          if (a.match(/^--with-pmix=/)) return '--with-pmix=$OMPI_PMIX_PREFIX'
          if (a.match(/^--with-libevent=/)) return '--with-libevent=$OMPI_LIBEVENT_PREFIX'
          return a
        })
      }
      // Remove gnu.org/gcc dep (gfortran) — not in S3 on darwin
      if (recipe.dependencies?.['gnu.org/gcc']) delete recipe.dependencies['gnu.org/gcc']
      // Fix sed -i BSD compat and install *.mod step
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string') {
            if (step.includes('sed -i') && !step.includes('sed -i.bak')) {
              recipe.build.script[i] = step.replace(/sed -i /g, 'sed -i.bak ')
            }
            // Make install *.mod conditional — fails when no Fortran modules exist.
            // Note: buildkit sets nullglob, so ls with empty glob = ls with no args = success.
            // Use compgen -G to properly test if glob matches any files.
            if (step.includes('install') && step.includes('*.mod')) {
              recipe.build.script[i] = 'if compgen -G "{{prefix}}/lib/*.mod" >/dev/null 2>&1; then install {{prefix}}/lib/*.mod {{prefix}}/include/; fi'
            }
          }
        }
      }
      // Disable Fortran since we don't have gfortran in S3
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        recipe.build.env.CONFIGURE_ARGS.push('--enable-mpi-fortran=no')
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
    platforms: {
      linux: {
        prependScript: [
          // Ubuntu 24.04 has xmu.pc but NOT xmuu.pc (libXmuu merged into libXmu).
          // Bypass pkg-config: provide XAUTH_CFLAGS/XAUTH_LIBS directly with -lXmu.
          'export XAUTH_CFLAGS="-I/usr/include"',
          'export XAUTH_LIBS="-L/usr/lib/x86_64-linux-gnu -lX11 -lXau -lXext -lXmu"',
        ],
      },
    },
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

  // ─── facebook.com/folly — fix sed -i BSD + remove gcc dep ──────────────

  'facebook.com/folly': {
    platforms: {
      darwin: {
        prependScript: [
          'brew install double-conversion fast_float glog gflags 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix glog)/lib/pkgconfig:$(brew --prefix gflags)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix glog)/lib -L$(brew --prefix gflags)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix glog)/include -I$(brew --prefix gflags)/include $CPPFLAGS"',
          // CMAKE_PREFIX_PATH set via env var (not -D flag) so it's not overridden by ARGS
          'export CMAKE_PREFIX_PATH="$(brew --prefix glog);$(brew --prefix gflags);$(brew --prefix double-conversion);$(brew --prefix fast_float);${CMAKE_PREFIX_PATH:-}"',
        ],
      },
      linux: {
        prependScript: [
          'sudo apt-get install -y libdouble-conversion-dev libgoogle-glog-dev libgflags-dev 2>/dev/null || true',
          // Install fast_float from source — Ubuntu's libfast-float-dev is too old (missing allow_leading_plus).
          // folly 2026.02+ needs fast_float >= 8.0.0.
          '(cd /tmp && curl -fsSL https://github.com/fastfloat/fast_float/archive/refs/tags/v8.0.0.tar.gz | tar xz && cd fast_float-8.0.0 && cmake -DCMAKE_INSTALL_PREFIX=/usr/local -DFASTFLOAT_TEST=OFF -S . -B build && cmake --build build && sudo cmake --install build && rm -rf /tmp/fast_float-8.0.0)',
          'export CMAKE_PREFIX_PATH="/usr/local:${CMAKE_PREFIX_PATH:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove linux gnu.org/gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux gnu.org/gcc/libstdcxx dep
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
      // Remove libcxx.llvm.org dep (too heavy for CI)
      if (recipe.dependencies?.linux?.['libcxx.llvm.org']) {
        delete recipe.dependencies.linux['libcxx.llvm.org']
      }
      // Remove glog/gflags S3 deps — use system-installed instead
      if (recipe.dependencies?.['google.com/glog']) delete recipe.dependencies['google.com/glog']
      if (recipe.dependencies?.['gflags.github.io']) delete recipe.dependencies['gflags.github.io']
      // Fix linux build: cmake adds -isystem /usr/include for system packages which
      // breaks #include_next <stdlib.h>. Prevent cmake from using -isystem for imported targets.
      // NOTE: Do NOT add -DCMAKE_PREFIX_PATH to ARGS — it overrides the env var set in prependScript.
      // CMAKE_PREFIX_PATH is set via env var in platform prependScript above.
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('-DCMAKE_NO_SYSTEM_FROM_IMPORTED=ON')
      }
      // Fix multi-line sed steps truncated by YAML parser.
      // 'run: sed -i -E\n  -e "..." folly-targets.cmake' becomes just 'sed -i -E'
      // 'run: sed -i\n  -e "..." libfolly.pc' becomes just 'sed -i'
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step !== 'object' || !step.run) continue
          // Fix folly-targets.cmake sed (multi-line truncated to 'sed -i -E')
          if (step.run === 'sed -i -E') {
            step.run = 'sed -i -E'
              + ' -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g"'
              + ' -e \'/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)[.0-9a-z]*/include|/v\\1/include|g\''
              + ' -e \'/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)[.0-9a-z]*/lib|/v\\1/lib|g\''
              + ' folly-targets.cmake'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/cmake/folly'
            }
          }
          // Fix libfolly.pc sed (multi-line truncated to 'sed -i')
          if (step.run === 'sed -i') {
            step.run = 'sed -i'
              + " -e 's/-I[^ ]* *//g'"
              + ' -e \'s:{{pkgx.prefix}}:${prefix}/../../..:g\''
              + ' libfolly.pc'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/pkgconfig'
            }
          }
        }
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
    platforms: {
      linux: {
        prependScript: [
          // Use system glog/gflags to match folly's ABI
          'sudo apt-get install -y libgoogle-glog-dev libgflags-dev 2>/dev/null || true',
        ],
      },
    },
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
      // Remove glog/gflags S3 deps — use system-installed to match folly's ABI
      if (recipe.dependencies?.['google.com/glog']) delete recipe.dependencies['google.com/glog']
      if (recipe.dependencies?.['gflags.github.io']) delete recipe.dependencies['gflags.github.io']
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
    platforms: {
      linux: {
        prependScript: [
          // Use system glog/gflags to match folly's ABI
          'sudo apt-get install -y libgoogle-glog-dev libgflags-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove glog/gflags S3 deps — use system-installed to match folly's ABI
      if (recipe.dependencies?.['google.com/glog']) delete recipe.dependencies['google.com/glog']
      if (recipe.dependencies?.['gflags.github.io']) delete recipe.dependencies['gflags.github.io']
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
    platforms: {
      darwin: {
        prependScript: [
          // Fix fmt::join missing in fmt 12+ — it moved to <fmt/ranges.h>
          'sed -i.bak \'1s/^/#include <fmt\\/ranges.h>\\n/\' thrift/lib/cpp2/server/RoundRobinRequestPile.h 2>/dev/null || true',
        ],
      },
      linux: {
        prependScript: [
          // Use system glog/gflags to match folly's ABI (folly is built against system glog)
          'sudo apt-get install -y libgoogle-glog-dev libgflags-dev 2>/dev/null || true',
          'export CMAKE_PREFIX_PATH="/usr/local:${CMAKE_PREFIX_PATH:-}"',
          // Fix fmt::join missing in fmt 12+ — it moved to <fmt/ranges.h>
          'sed -i \'1s/^/#include <fmt\\/ranges.h>\\n/\' thrift/lib/cpp2/server/RoundRobinRequestPile.h 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove glog/gflags S3 deps — use system-installed to match folly's ABI
      if (recipe.dependencies?.['google.com/glog']) delete recipe.dependencies['google.com/glog']
      if (recipe.dependencies?.['gflags.github.io']) delete recipe.dependencies['gflags.github.io']
      // Fix sed steps: the YAML parser truncates multi-line plain scalar continuation,
      // so 'run: sed -i -E\n  -e "..." FBThriftTargets.cmake' becomes just 'sed -i -E'.
      // Reconstruct the full commands. The sed wrapper in buildkit.ts handles -i BSD compat.
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          // Fix the post-install cmake targets sed (truncated multi-line)
          if (typeof step === 'object' && (step.run === 'sed -i -E' || step.run === 'sed -i')) {
            step.run = 'sed -i -E'
              + ' -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g"'
              + ' -e \'/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)[.0-9a-z]*/include|/v\\1/include|g\''
              + ' -e \'/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)[.0-9a-z]*/lib|/v\\1/lib|g\''
              + ' FBThriftTargets.cmake'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/cmake/fbthrift'
            }
          }
          // Fix other sed -i BSD compat (single-line seds that parsed correctly)
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i ') && !step.run.includes('sed -i.bak ')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i ') && !step.includes('sed -i.bak ')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
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
      // Fix sed step: the YAML parser doesn't handle multi-line plain scalar continuation
      // for 'run: sed -i\n  -e "s:..." mvfst-targets.cmake', so it only captures 'sed -i'
      // and loses the -e expression and filename args. Also loses the working-directory sibling key.
      // Reconstruct the full command here. The sed wrapper in buildkit.ts handles -i BSD compat.
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run === 'sed -i') {
            step.run = 'sed -i -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g" mvfst-targets.cmake'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/cmake/mvfst'
            }
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

  // ─── facebook.com/watchman — fix cmake prefix + sed -i BSD + remove gcc ─

  'facebook.com/watchman': {
    platforms: {
      linux: {
        prependScript: [
          // Use system glog/gflags to match folly's ABI
          'sudo apt-get install -y libgoogle-glog-dev libgflags-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          // pywatchman install needs setuptools
          'pip3 install setuptools 2>/dev/null || python3 -m pip install setuptools 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove glog/gflags S3 deps — use system-installed to match folly's ABI
      if (recipe.dependencies?.['google.com/glog']) delete recipe.dependencies['google.com/glog']
      if (recipe.dependencies?.['gflags.github.io']) delete recipe.dependencies['gflags.github.io']
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Pre-install rust-src to prevent race condition when parallel cmake jobs
      // both try to rustup component add rust-src simultaneously
      if (Array.isArray(recipe.build?.script)) {
        const cmakeIdx = recipe.build.script.findIndex((s: any) =>
          typeof s === 'string' && s.includes('cmake -S'))
        if (cmakeIdx >= 0) {
          recipe.build.script.splice(cmakeIdx, 0, 'rustup component add rust-src 2>/dev/null || true')
        }
      }
      // Fix YAML '' escape issue and sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          // Fix run array steps with YAML '' escaping that breaks bash
          if (typeof step === 'object' && Array.isArray(step.run)) {
            step.run = step.run.map((line: string) => {
              // Fix: newline=''...'' → properly single-quoted bash string
              if (line.startsWith("newline=''") && line.endsWith("''")) {
                const inner = line.slice("newline=''".length, -"''".length)
                return `newline='${inner}'`
              }
              return line
            })
          }
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
      // Remove linux gnu.org/gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      // Remove linux libcxx.llvm.org dep
      if (recipe.dependencies?.linux?.['libcxx.llvm.org']) {
        delete recipe.dependencies.linux['libcxx.llvm.org']
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

  // ─── x.org/x11 — fix prefix quoting ─────────────────────────────────

  'x.org/x11': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and other args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── x.org/libxfont2 — simple autotools, no extra fixes needed ───────

  'x.org/libxfont2': {
    // Simple autotools build with clean --prefix={{prefix}} inline
    // No fixes needed beyond what's in CI
  },

  // ─── wpewebkit.org/libwpe — remove mesa3d.org + gcc deps (use system) ─────

  'wpewebkit.org/libwpe': {
    modifyRecipe: (recipe: any) => {
      // Remove mesa3d.org dep (use system EGL/mesa headers)
      if (recipe.dependencies?.['mesa3d.org']) {
        delete recipe.dependencies['mesa3d.org']
      }
      // Remove xkbcommon.org dep (use system libxkbcommon)
      if (recipe.dependencies?.['xkbcommon.org']) {
        delete recipe.dependencies['xkbcommon.org']
      }
      // Remove gnu.org/gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.['gnu.org/gcc']) {
        delete recipe.build.dependencies['gnu.org/gcc']
      }
      // Fix --prefix and --libdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── wpewebkit.org/wpebackend-fdo — fix prefix quoting + sed -i BSD + remove gcc ─

  'wpewebkit.org/wpebackend-fdo': {
    platforms: {
      linux: {
        prependScript: [
          // libwpe-1.0-dev is not available on Ubuntu 24.04 — build libwpe from source
          '(cd /tmp && curl -fsSL https://github.com/WebPlatformForEmbedded/libwpe/releases/download/1.16.3/libwpe-1.16.3.tar.xz | tar xJ && cd libwpe-1.16.3 && meson setup build --prefix=/usr/local --libdir=/usr/local/lib --buildtype=release --wrap-mode=nofallback && meson compile -C build && sudo meson install -C build && rm -rf /tmp/libwpe-1.16.3)',
          'export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LIBRARY_PATH="/usr/local/lib:${LIBRARY_PATH:-}"',
          'export LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and --libdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2').replace(/^(--libdir=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
              .replace(/sed -i -f /g, 'sed -i.bak -f ')
          }
        }
      }
      // Remove gnu.org/gcc build dep (use system compiler)
      if (recipe.build?.dependencies?.['gnu.org/gcc']) {
        delete recipe.build.dependencies['gnu.org/gcc']
      }
      // Remove mesa3d.org dep (not in S3)
      if (recipe.dependencies?.['mesa3d.org']) {
        delete recipe.dependencies['mesa3d.org']
      }
    },
  },

  // ─── luarocks.org — fix prefix quoting + sed -i BSD + remove info-zip dep ─

  'luarocks.org': {
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and other args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2')
           .replace(/^(--sysconfdir=)"([^"]+)"$/, '$1$2')
           .replace(/^(--rocks-tree=)"([^"]+)"$/, '$1$2'),
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
        }
      }
      // Remove info-zip.org/unzip dep (not in S3)
      if (recipe.dependencies?.['info-zip.org/unzip']) {
        delete recipe.dependencies['info-zip.org/unzip']
      }
    },
  },

  // ─── mypy-lang.org — widen python version constraint ─────────────────

  'mypy-lang.org': {
    modifyRecipe: (recipe: any) => {
      // Widen python version constraint to include 3.12
      if (recipe.build?.dependencies?.['python.org'] === '>=3<3.12') {
        recipe.build.dependencies['python.org'] = '>=3<3.13'
      }
    },
  },

  // ─── crates.io/qsv — remove linux wayland dep ────────────────────────

  'crates.io/qsv': {
    modifyRecipe: (recipe: any) => {
      // Remove linux wayland dep (not in S3)
      if (recipe.dependencies?.linux?.['wayland.freedesktop.org']) {
        delete recipe.dependencies.linux['wayland.freedesktop.org']
      }
      // Remove wayland feature from cargo args
      if (Array.isArray(recipe.build?.env?.CARGO_ARGS)) {
        recipe.build.env.CARGO_ARGS = recipe.build.env.CARGO_ARGS.map((a: string) =>
          a.includes('clipboard') ? a.replace(',clipboard', '') : a,
        )
      }
    },
  },

  // ─── musepack.net/libcuefile — fix stray cmake prefix quote + remove gcc dep ─

  'musepack.net/libcuefile': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── musepack.net/libreplaygain — fix stray cmake prefix quote ────────

  'musepack.net/libreplaygain': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── github.com/sctplab/usrsctp — fix stray cmake prefix quote + remove gcc ─

  'github.com/sctplab/usrsctp': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── github.com/luvit/luv — fix stray cmake prefix quote ─────────────

  'github.com/luvit/luv': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── github.com/oneapi-src/oneTBB — fix stray cmake prefix quote ─────

  'github.com/oneapi-src/oneTBB': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── github.com/KhronosGroup/Vulkan-Loader — fix stray cmake prefix + remove wayland ─

  'github.com/KhronosGroup/Vulkan-Loader': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove linux wayland dep (not in S3)
      if (recipe.dependencies?.linux?.['wayland.freedesktop.org']) {
        delete recipe.dependencies.linux['wayland.freedesktop.org']
      }
    },
  },

  // ─── ceres-solver.org — fix stray cmake prefix quote + remove gcc dep ─

  'ceres-solver.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── geuz.org/gl2ps — fix stray cmake prefix quote + remove freeglut dep ─

  'geuz.org/gl2ps': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove linux freeglut dep (depends on mesa3d.org not in S3)
      if (recipe.dependencies?.linux?.['freeglut.sourceforge.io']) {
        delete recipe.dependencies.linux['freeglut.sourceforge.io']
      }
    },
  },

  // ─── upx.github.io — fix stray cmake prefix quote + remove ucl dep ───

  'upx.github.io': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove oberhumer.com/ucl dep (dead upstream domain)
      if (recipe.build?.dependencies?.['oberhumer.com/ucl']) {
        delete recipe.build.dependencies['oberhumer.com/ucl']
      }
    },
  },

  // ─── github.com/fastfloat/fast_float — fix stray cmake prefix quote ──

  'github.com/fastfloat/fast_float': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── assimp.org — fix stray cmake prefix quote ───────────────────────

  'assimp.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── libgit2.org — fix cmake prefix quote (uses ARGS not CMAKE_ARGS) ──

  'libgit2.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── libwebsockets.org — fix inline cmake prefix quote in script string ──

  'libwebsockets.org': {
    modifyRecipe: (recipe: any) => {
      // cmake prefix is inline in script string, not in env array
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
        }
      }
    },
  },

  // ─── libzip.org — fix cmake prefix quote (uses ARGS not CMAKE_ARGS) ───

  'libzip.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── google.com/sentencepiece — fix cmake prefix quote (full quotes) ────

  'google.com/sentencepiece': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── google.com/double-conversion — fix inline cmake prefix quote in script ─

  'google.com/double-conversion': {
    modifyRecipe: (recipe: any) => {
      // cmake prefix is inline in script string, not in env array
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
        }
      }
    },
  },

  // ─── aomedia.googlesource.com/aom — fix cmake prefix quote ──────────

  'aomedia.googlesource.com/aom': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── apache.org/avro — fix stray cmake prefix quote + remove gcc dep ─

  'apache.org/avro': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── dkrz.de/libaec — fix cmake prefix quote (both ARGS and CMAKE_ARGS) ─

  'dkrz.de/libaec': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/KhronosGroup/Vulkan-Headers — fix cmake prefix quote + remove llvm test dep ─

  'github.com/KhronosGroup/Vulkan-Headers': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/facebookincubator/fizz — fix cmake prefix quote + remove gcc dep ─

  'github.com/facebookincubator/fizz': {
    modifyRecipe: (recipe: any, platform?: string) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2')
           .replace(/^(-DCMAKE_INSTALL_RPATH=)"([^"]+)"$/, '$1$2'),
        )
      }
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) {
        delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      }
      // Fix sed -i BSD compat (macOS requires suffix argument)
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak') && !step.includes('sed -i -f')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed (-E )?-i([ \n])/g, 'sed $1-i.bak$2')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            if (step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
              step.run = step.run.replace(/sed (-E )?-i([ \n])/g, 'sed $1-i.bak$2')
                .replace(/sed -i -f /g, 'sed -i.bak -f ')
            }
          }
        }
        // NOTE: glog ABI mismatch (system 0.6 vs buildkit 0.7) is now handled
        // generically in buildkit.ts (syslib-override) for all packages on Linux.
      }
    },
  },

  // ─── github.com/aws/aws-sdk-cpp — fix cmake prefix quote ─────────────

  'github.com/aws/aws-sdk-cpp': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/danfis/libccd — fix cmake prefix quote ───────────────

  'github.com/danfis/libccd': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/PJK/libcbor — fix cmake prefix quote ────────────────

  'github.com/PJK/libcbor': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/Esri/lerc — fix cmake prefix quote ───────────────────

  'github.com/Esri/lerc': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── github.com/ebiggers/libdeflate — fix cmake prefix quote ─────────

  'github.com/ebiggers/libdeflate': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── openblas.net — fix cmake prefix quote ───────────────────────────

  'openblas.net': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── cgal.org — fix stray cmake prefix quote + remove qt5/gcc deps ──

  'cgal.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
        // Remove Qt5 cmake args (qt.io not in S3)
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.filter((a: string) =>
          !a.includes('Qt5') && !a.includes('QT_DIRS'),
        )
      }
      // Remove qt.io build dep
      if (recipe.build?.dependencies?.['qt.io']) {
        delete recipe.build.dependencies['qt.io']
      }
      // Remove linux gcc build dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── fishshell.com — fix cmake prefix quote + sed -i BSD ─────────────

  'fishshell.com': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Fix sed -i BSD compat
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replace(/sed -i /g, 'sed -i.bak ')
          }
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replace(/sed -i /g, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── fmt.dev — fix cmake prefix quote ────────────────────────────────

  'fmt.dev': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── facebook.com/zstd — fix cmake prefix quote ───────────────────────

  'facebook.com/zstd': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── libsdl.org — fix cmake prefix quote + remove linux X11 deps ─────

  'libsdl.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--prefix=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── glew.sourceforge.io — fix cmake prefix quote ────────────────────

  'glew.sourceforge.io': {
    modifyRecipe: (recipe: any) => {
      // cmake prefix is inline in script string, not in env array
      // Fix via script step patching
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
        }
      }
    },
  },

  // ─── qhull.org — fix cmake prefix quote ──────────────────────────────

  'qhull.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── duckdb.org — fix cmake prefix quote (uses ARGS not CMAKE_ARGS) ──

  'duckdb.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"$/, '$1$2'),
        )
      }
    },
  },

  // ─── freetype.org — uses '{{ prefix }}' with spaces, already valid ────
  // No fix needed for freetype.org cmake prefix

  // ─── fna-xna.github.io — fix stray cmake prefix quote (uses ARGS) ────

  'fna-xna.github.io': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
    },
  },

  // ─── github.com/json-c/json-c — fix inline cmake prefix quote in script ─

  'github.com/json-c/json-c': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
        }
      }
    },
  },

  // ─── c-ares.org — fix inline cmake prefix quote in script string ─────

  'c-ares.org': {
    modifyRecipe: (recipe: any) => {
      // cmake prefix is inline in a script string, not in env array
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
        }
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
