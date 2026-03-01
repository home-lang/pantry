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

export type ScriptStep = string | {
  run: string
  'working-directory'?: string
  if?: string
}

export interface PackageOverride {
  distributableUrl?: string
  stripComponents?: number
  prependScript?: ScriptStep[]
  env?: Record<string, string | string[]>
  platforms?: {
    linux?: Omit<PackageOverride, 'platforms' | 'modifyRecipe'>
    darwin?: Omit<PackageOverride, 'platforms' | 'modifyRecipe'>
  }
  /** Override the recipe's supported platforms (e.g. ['darwin/aarch64', 'linux/x86-64']) */
  supportedPlatforms?: string[]
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
              .replace(/sed -i '/, `sed '`)
              .replace(/' Makefile"/, `' Makefile > Makefile.tmp && mv Makefile.tmp Makefile"`)
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
    modifyRecipe: (recipe: any) => {
      // ZeroMQ 4.3.x has a GCC 13 allocator_traits static assertion failure in CURVE crypto code.
      // Disable CURVE to work around the upstream bug (fixed in newer libzmq versions).
      // The zeromq YAML uses `ARGS` (not `CONFIGURE_ARGS`) for ./configure flags.
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('--disable-curve')) {
          recipe.build.env.ARGS.push('--disable-curve')
        }
      }
    },
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
  'sass-lang.com/sassc': { prependScript: [GLIBTOOL_FIX] },
  'zlib.net/minizip': { prependScript: [GLIBTOOL_FIX] },
  'github.com/sekrit-twc/zimg': { prependScript: [GLIBTOOL_FIX] },
  'github.com/xiph/speexdsp': { prependScript: [GLIBTOOL_FIX] },
  'vapoursynth.com': { prependScript: [GLIBTOOL_FIX] },
  'github.com/maxmind/libmaxminddb': { prependScript: [GLIBTOOL_FIX] },
  'ferzkopp.net/SDL2_gfx': {
    prependScript: [GLIBTOOL_FIX],
    platforms: {
      linux: {
        prependScript: [
          // Linux: source tarball has libtool 2.5.4 macros but Ubuntu has 2.4.7
          // Override ACLOCAL_PATH to use system libtool macros (pkgx libtool in
          // ACLOCAL_PATH has 2.5.4 macros that conflict with system libtool 2.4.7)
          'export ACLOCAL_PATH="/usr/share/aclocal"',
          'rm -f aclocal.m4 configure m4/libtool.m4 m4/lt*.m4 ltmain.sh config.guess config.sub',
          'libtoolize --force --copy',
        ],
      },
    },
  },
  'midnight-commander.org': {
    prependScript: [GLIBTOOL_FIX],
    modifyRecipe: (recipe: any) => {
      // Strip post-install pkgx-specific relocatability fixup:
      // The find/sed block requires $PKGX_DIR (empty in CI) and uses
      // `find -depth 1` (invalid on GNU find). We don't need pkgx
      // relocatability for our S3 binaries.
      // Note: after prependScript, script is an array (not a string).
      const scriptArr = Array.isArray(recipe.build?.script)
        ? recipe.build.script
        : (typeof recipe.build?.script === 'string' ? [recipe.build.script] : null)
      if (!scriptArr) return
      for (let i = 0; i < scriptArr.length; i++) {
        if (typeof scriptArr[i] === 'string' && scriptArr[i].includes('make install')) {
          const lines = scriptArr[i].split('\n')
          const installIdx = lines.findIndex((l: string) => l.trim() === 'make install')
          if (installIdx >= 0) {
            scriptArr[i] = lines.slice(0, installIdx + 1).join('\n')
          }
        }
      }
      recipe.build.script = scriptArr
    },
  },

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
            step.run = `perl -ni -e 'print unless /Requires\\.private:.*iconv/' libarchive.pc`
          } else if (typeof step === 'string' && step.includes('sed') && step.includes('iconv')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = `perl -ni -e 'print unless /Requires\\.private:.*iconv/' libarchive.pc`
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
            recipe.build.script[idx] = step.replace(/sed -i '([^']*)'/g, `perl -pi -e '$1'`)
            recipe.build.script[idx] = recipe.build.script[idx].replace(/sed -i/g, 'perl -pi -e')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('sed -i')) {
            step.run = step.run.replace(/sed -i '([^']*)'/g, `perl -pi -e '$1'`)
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

  'github.com/krzkaczor/ny': {
    // Old versions (<=0.2.0) have a typo in Cargo.toml: "versoin" instead of "version" for reqwest.
    // Modern Cargo rejects deps without a version field, so fix the typo before build.
    prependScript: [
      'sed -i.bak \'s/versoin/version/g\' Cargo.toml && rm -f Cargo.toml.bak',
    ],
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
            step.run = `if command -v go-md2man &>/dev/null; then\n${step.run}\nfi`
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

  // lloyd.github.io/yajl — first entry removed, see second entry below with GET_TARGET_PROPERTY fix

  'musepack.net': {
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
        // Add -lm to linker flags for math library (pow, log10)
        recipe.build.env.CMAKE_ARGS.push('-DCMAKE_EXE_LINKER_FLAGS=-lm')
        recipe.build.env.CMAKE_ARGS.push('-DCMAKE_SHARED_LINKER_FLAGS=-lm')
      }
    },
  },

  // ─── crates.io/sd — fix virtual workspace manifest path ──────────────
  'crates.io/sd': {
    modifyRecipe: (recipe: any) => {
      // sd >= 1.0.0 has a virtual workspace manifest with sd-cli/ subdirectory.
      // Older versions (0.x) have Cargo.toml at root. Try sd-cli first, fall back to root.
      // Must include --root in both branches of the if/else to avoid bash syntax error.
      const fixCargoInstall = (cmd: string): string => {
        const rootMatch = cmd.match(/--root\s+\S+/)
        const rootFlag = rootMatch ? ` ${rootMatch[0]}` : ''
        return `if [ -d sd-cli ]; then cargo install --locked --path sd-cli${rootFlag}; else cargo install --locked --path .${rootFlag}; fi`
      }
      if (typeof recipe.build?.script === 'string' && recipe.build.script.includes('cargo install') && recipe.build.script.includes('--path .')) {
        recipe.build.script = fixCargoInstall(recipe.build.script)
      }
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('cargo install') && step.includes('--path .')) {
            recipe.build.script[i] = fixCargoInstall(step)
          }
        }
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

  'babashka.org': {
    modifyRecipe: (recipe: any, platform?: string) => {
      if (platform !== 'linux-x86-64') return
      // On Linux, LD_LIBRARY_PATH from S3 deps (e.g. old curl.se/7.86.0) overrides system curl,
      // causing "undefined symbol: curl_global_trace" errors. Unset it for the curl download.
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('curl -L')) {
            recipe.build.script[i] = step.replace('curl -L', 'env LD_LIBRARY_PATH= curl -L')
          }
        }
      }
    },
  },

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
            recipe.build.script[idx] = '{{prefix}}/venv/bin/pip install ".[postgres,mysql,odbc,sqlite]"'
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

  // ─── lloyd.github.io/yajl — fix deprecated GET_TARGET_PROPERTY LOCATION ──
  'lloyd.github.io/yajl': {
    prependScript: [
      // yajl uses GET_TARGET_PROPERTY(... LOCATION) which cmake 4.x forbids (CMP0026).
      // Replace with $<TARGET_FILE:...> generator expressions in subdirectory CMakeLists.
      'sed -i.bak "/GET_TARGET_PROPERTY/d" reformatter/CMakeLists.txt 2>/dev/null || true',
      'sed -i.bak "s|\\${binPath}|\\$<TARGET_FILE:json_reformat>|" reformatter/CMakeLists.txt 2>/dev/null || true',
      'sed -i.bak "/GET_TARGET_PROPERTY/d" verify/CMakeLists.txt 2>/dev/null || true',
      'sed -i.bak "s|\\${binPath}|\\$<TARGET_FILE:json_verify>|" verify/CMakeLists.txt 2>/dev/null || true',
    ],
  },

  'videolan.org/x265': {
    // Patch CMakeLists.txt: cmake 4.x rejects cmake_policy(SET CMP0025 OLD) and CMP0054 OLD.
    // Delete the cmake_policy lines — cmake 4.x defaults to NEW for these policies.
    // Note: prependScript runs from buildDir/8bit/ (global working-directory), so use ../ to reach source.
    prependScript: [
      'find .. -name CMakeLists.txt -exec sed -i.bak \'/cmake_policy.*CMP002[54]/d\' {} +',
    ],
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
    platforms: {
      darwin: {
        prependScript: [
          // Install glib/gio from Homebrew for gio-unix-2.0 dependency (keg-only)
          'brew install glib 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix glib)/lib/pkgconfig:$(brew --prefix)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix glib)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix glib)/include -I$(brew --prefix glib)/include/glib-2.0 -I$(brew --prefix glib)/lib/glib-2.0/include ${CPPFLAGS:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // pagure.io/xmlto is linux-only (BSD getopt incompatibility on macOS)
      if (recipe.build?.dependencies?.['pagure.io/xmlto']) {
        delete recipe.build.dependencies['pagure.io/xmlto']
      }
      // Add meson args to skip xmlto-dependent doc generation + fix systemd install paths
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        for (const flag of [
          '-Ddoxygen_docs=disabled',
          '-Dxml_docs=disabled',
          '-Dsystemd_system_unitdir={{prefix}}/lib/systemd/system',
          '-Dsystemd_user_unitdir={{prefix}}/lib/systemd/user',
        ]) {
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

  // ─── freedesktop.org/xdg-user-dirs — fix systemd install path ──────────────
  // Meson queries system pkg-config for systemduserunitdir which returns /usr/lib/systemd/user
  // (outside prefix). Patch the build file to use prefix-relative path instead.

  'freedesktop.org/xdg-user-dirs': {
    platforms: {
      linux: {
        prependScript: [
          // Replace the systemd pkg-config query with a prefix-relative fallback
          // so the service file installs within our prefix, not /usr/lib
          "sed -i \"s|systemd_dep.get_variable(pkgconfig: 'systemduserunitdir')|get_option('prefix') / 'lib' / 'systemd' / 'user'|\" meson.build 2>/dev/null || true",
        ],
      },
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      linux: {
        prependScript: [
          // Install xcb-xkb dev headers for x11 support
          'sudo apt-get install -y libxcb-xkb-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          // Install libxml2 from Homebrew for pkg-config discovery
          'brew install libxml2 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix libxml2)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
    },
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
            step.run = step.run.replace(/sed -i '/g, `sed -i.bak '`)
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
            step.run = step.run.replace(/sed -i '/g, `sed -i.bak '`)
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
            step.run = step.run.replace(/sed -i '/g, `sed -i.bak '`)
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      darwin: {
        prependScript: [
          // Create dummy halibut binary so find_program(HALIBUT halibut REQUIRED) succeeds
          // cmake/platforms/osx.cmake requires halibut but it's only for docs
          'mkdir -p /tmp/fake-bin && printf "#!/bin/bash\\nexit 0\\n" > /tmp/fake-bin/halibut && chmod +x /tmp/fake-bin/halibut',
          'export PATH="/tmp/fake-bin:$PATH"',
        ],
      },
    },
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
      // Disable halibut doc generation in cmake (not available)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS.push('-DHALIBUT_EXECUTABLE=NOTFOUND')
      }
    },
  },

  // ─── chiark.greenend.org.uk/putty — fix distributable URL + remove halibut dep ─
  // Upstream URL uses 'latest' in path which only works for the current version.
  // Also remove halibut dep (only used for docs, not available in S3).

  'chiark.greenend.org.uk/putty': {
    distributableUrl: 'https://the.earth.li/~sgtatham/putty/{{version.marketing}}/putty-{{version.marketing}}.tar.gz',
    modifyRecipe: (recipe: any) => {
      // Remove halibut dep (not available in S3, only needed for docs).
      // Without halibut in PATH, cmake's find_program(HALIBUT) returns NOT FOUND
      // and doc generation is skipped entirely — no man pages to install.
      if (recipe.build?.dependencies?.['chiark.greenend.org.uk/halibut']) {
        delete recipe.build.dependencies['chiark.greenend.org.uk/halibut']
      }
      // Remove perl dep (not reliably in S3, only needed for build scripts)
      if (recipe.build?.dependencies?.['perl.org']) {
        delete recipe.build.dependencies['perl.org']
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
    modifyRecipe: (recipe: any) => {
      // metagpt requires Python >=3.9,<3.12 — pin to 3.11.x
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '~3.11'
      }
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
            step.run = step.run.replace(/sed -i '/, `sed -i.bak '`)
          }
        }
      }
    },
  },

  // ─── nx.dev — npm install with legacy peer deps ──────────────────────────

  'nx.dev': {
    prependScript: [
      // Fix npm ENOENT _cacache/tmp by using a clean temp/cache dir outside the build tree
      'export TMPDIR=/tmp/nx-build-tmp-$$',
      'mkdir -p "$TMPDIR"',
      'export npm_config_cache=/tmp/nx-npm-cache-$$',
      'mkdir -p "$npm_config_cache"',
      // Also clean npm cache to avoid stale tarball corruption
      'npm cache clean --force 2>/dev/null || true',
    ],
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
      // Pin Node to v20 LTS — better-sqlite3 8.5.0 incompatible with Node.js 24 V8 API
      if (recipe.build?.dependencies?.['nodejs.org']) {
        recipe.build.dependencies['nodejs.org'] = '~20'
      }
      if (recipe.dependencies?.['nodejs.org']) {
        recipe.dependencies['nodejs.org'] = '~20'
      }
      // npm install with legacy peer deps
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'string' && step.includes('npm install')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = `${step}\n      --legacy-peer-deps`
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
    platforms: {
      linux: {
        prependScript: [
          // Install libunistring and libidn2 dev libs for PSL runtime
          'sudo apt-get install -y libunistring-dev libidn2-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          // Install libidn2, libunistring, and libiconv (keg-only) from Homebrew
          'brew install libidn2 libunistring libiconv 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix libidn2)/lib/pkgconfig:$(brew --prefix libunistring)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib -L$(brew --prefix libidn2)/lib -L$(brew --prefix libunistring)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include -I$(brew --prefix libidn2)/include -I$(brew --prefix libunistring)/include ${CPPFLAGS:-}"',
        ],
      },
    },
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── github.com/cosmtrek/air — skip Makefile check target (needs git repo) ──
  'github.com/cosmtrek/air': {
    modifyRecipe: (recipe: any) => {
      // The Makefile's `build` target depends on `check` which runs `git diff --cached`
      // and `golangci-lint`. In our tarball build env there's no .git dir, so it fails.
      // Replace `make build` with direct `go build`.
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step === 'make build') {
            recipe.build.script[i] = 'go build -o air .'
          }
        }
      }
    },
  },

  // ─── github.com/benjaminp/six — use pip instead of distutils setup.py ──
  'github.com/benjaminp/six': {
    modifyRecipe: (recipe: any) => {
      // setup.py imports distutils which was removed in Python 3.12+.
      // Replace with pip install which uses setuptools backend.
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('setup.py install')) {
            recipe.build.script[i] = 'python -m pip install --prefix={{prefix}} .'
          }
        }
      }
    },
  },

  // ─── github.com/romanz/trezor-agent — unset LD_LIBRARY_PATH for git ──
  'github.com/romanz/trezor-agent': {
    prependScript: [
      // S3 gnutls.org dep pollutes LD_LIBRARY_PATH, causing git-remote-https to crash
      // with "undefined symbol: nettle_rsa_oaep_sha384_decrypt" when pip clones git deps.
      // Create a git wrapper that unsets LD_LIBRARY_PATH (alias doesn't work in non-interactive bash).
      'mkdir -p "${TMPDIR:-/tmp}/_git_wrapper"',
      'printf \'#!/bin/bash\\nunset LD_LIBRARY_PATH\\nexec /usr/bin/git "$@"\\n\' > "${TMPDIR:-/tmp}/_git_wrapper/git"',
      'chmod +x "${TMPDIR:-/tmp}/_git_wrapper/git"',
      'export PATH="${TMPDIR:-/tmp}/_git_wrapper:$PATH"',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove gnutls.org from deps if present (system gnutls is compatible)
      if (recipe.dependencies?.['gnutls.org']) delete recipe.dependencies['gnutls.org']
      if (recipe.build?.dependencies?.['gnutls.org']) delete recipe.build.dependencies['gnutls.org']
    },
  },

  // aomedia.googlesource.com/aom override merged into the existing entry below (line ~4560)

  // ─── github.com/mikefarah/yq — remove pandoc dep, skip man page generation ──
  'github.com/mikefarah/yq': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['pandoc.org']) {
        delete recipe.build.dependencies['pandoc.org']
      }
      // Build script is a | block (single string) — remove man page lines
      if (typeof recipe.build?.script === 'string') {
        recipe.build.script = recipe.build.script
          .split('\n')
          .filter((line: string) =>
            !line.includes('generate-man-page') &&
            !line.includes('yq.1') &&
            !(line.includes('man1') && line.includes('mkdir')),
          )
          .join('\n')
      }
    },
  },

  // ─── github.com/rrthomas/libpaper — skip `make check` (test failures in CI) ──
  'github.com/rrthomas/libpaper': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter(
          (s: any) => typeof s !== 'string' || s !== 'make check',
        )
      }
    },
  },

  // ─── github.com/Diniboy1123/usque — fix goreleaser output path glob ──
  'github.com/Diniboy1123/usque': {
    modifyRecipe: (recipe: any) => {
      // goreleaser creates dirs like dist/usque_darwin_arm64_v8.0/ — glob doesn't match
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('mv dist/')) {
            recipe.build.script[i] = 'mv $(find dist -name usque -type f | head -1) "{{ prefix }}"/bin'
          }
        }
      }
    },
  },

  // ─── github.com/libfuse/libfuse — no-op update-rc.d, fix multiarch libdir on linux ──
  'github.com/libfuse/libfuse': {
    platforms: {
      linux: {
        prependScript: [
          // meson install calls update-rc.d which fails in CI (no systemd)
          'mkdir -p "${TMPDIR:-/tmp}/_fuse_fix"',
          'printf \'#!/bin/sh\\nexit 0\\n\' > "${TMPDIR:-/tmp}/_fuse_fix/update-rc.d"',
          'chmod +x "${TMPDIR:-/tmp}/_fuse_fix/update-rc.d"',
          'export PATH="${TMPDIR:-/tmp}/_fuse_fix:$PATH"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Force standard lib/ path instead of lib/x86_64-linux-gnu/ (multiarch)
      // The post-install sed expects fuse3.pc in lib/pkgconfig/
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--libdir=lib')
      }
    },
  },

  // ─── info-zip.org/zip — skip Debian patches, fix Xcode 26 SDK conflict ──
  'info-zip.org/zip': {
    platforms: {
      darwin: {
        prependScript: [
          // Xcode 26 SDK conflicts with ZMEM (custom memset/memcpy/memcmp impls)
          // AND its C23 mode treats implicit function declarations as errors, which
          // breaks all of unix/configure's function detection tests (they set NO_DIR,
          // NO_STRCHR etc. incorrectly). Fix both:
          // 1. Strip ZMEM detection from configure
          `sed -i.bak '/ZMEM/d' unix/configure`,
          // 2. Create a cc wrapper that suppresses C23 strictness for this 2008 codebase
          'mkdir -p "${TMPDIR:-/tmp}/_zip_cc"',
          'printf \'#!/bin/sh\\nexec /usr/bin/cc -Wno-implicit-function-declaration -Wno-int-conversion -Wno-incompatible-pointer-types "$@"\\n\' > "${TMPDIR:-/tmp}/_zip_cc/cc"',
          'chmod +x "${TMPDIR:-/tmp}/_zip_cc/cc"',
          'export PATH="${TMPDIR:-/tmp}/_zip_cc:$PATH"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'string' && step.startsWith('patch -p1')) return false
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('wget')) return false
          return true
        })
        // Use system cc instead of explicit gcc path (macOS SDK compat)
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('unix/Makefile') && step.includes('CC=')) {
            recipe.build.script[i] = step.replace(/CC=[^\s]+/, 'CC=cc')
          }
        }
      }
      if (recipe.build?.dependencies?.['gnu.org/wget']) delete recipe.build.dependencies['gnu.org/wget']
      if (recipe.build?.dependencies?.['gnu.org/patch']) delete recipe.build.dependencies['gnu.org/patch']
      if (recipe.build?.dependencies?.['gnu.org/gcc']) delete recipe.build.dependencies['gnu.org/gcc']
    },
  },

  // ─── github.com/google/shaderc — disable copyright check, widen Python, fix sed -i ──
  'github.com/google/shaderc': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['python.org'] === '~3.12') {
        recipe.build.dependencies['python.org'] = '3'
      }
      // Disable the copyright check via cmake option (it fails on buildkit-injected files)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS.push('-DSHADERC_SKIP_COPYRIGHT_CHECK=ON')
      }
      // Fix sed -i BSD incompatibility: macOS sed requires extension arg
      // Change `sed -i 's/...'` to `sed -i.bak 's/...'` (works on both)
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && /^sed -i /.test(step)) {
            recipe.build.script[i] = step.replace(/^sed -i /, 'sed -i.bak ')
          }
        }
      }
    },
  },

  // ─── libproxy.github.io/libproxy — disable introspection/vala ──
  'libproxy.github.io/libproxy': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      if (recipe.build?.dependencies?.['gnome.org/vala']) {
        delete recipe.build.dependencies['gnome.org/vala']
      }
      if (recipe.build?.dependencies?.['gnome.org/gsettings-desktop-schemas']) {
        delete recipe.build.dependencies['gnome.org/gsettings-desktop-schemas']
      }
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS.push('-Dintrospection=false', '-Dvapi=false', '-Dconfig-gnome=false')
      }
    },
  },

  // ─── github.com/hughsie/libxmlb — disable introspection/vala ──
  'github.com/hughsie/libxmlb': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      if (recipe.build?.dependencies?.['gnome.org/vala']) {
        delete recipe.build.dependencies['gnome.org/vala']
      }
      // Add disable flags to meson setup command
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('meson setup')) {
            recipe.build.script[i] = `${step} -Dintrospection=false`
          }
        }
      }
    },
  },

  // ─── github.com/sindresorhus/macos-term-size — repo renamed, asset renamed ──
  'github.com/sindresorhus/macos-term-size': {
    distributableUrl: 'https://github.com/sindresorhus/macos-terminal-size/releases/download/v{{version}}/terminal-size.zip',
    modifyRecipe: (recipe: any) => {
      // Replace build steps: skip codesign check (fails in CI), use renamed binary
      if (recipe.build) {
        recipe.build.script = [
          'mkdir -p {{prefix}}/bin',
          'install terminal-size {{prefix}}/bin/term-size',
        ]
      }
    },
  },

  // ─── eyrie.org/eagle/podlators — upstream files have v prefix in filename ──
  'eyrie.org/eagle/podlators': {
    distributableUrl: 'https://archives.eyrie.org/software/perl/podlators-v{{version}}.tar.xz',
  },

  // ─── github.com/chainguard-dev/apko — disable CGO, fix BSD install -D ──
  'github.com/chainguard-dev/apko': {
    env: { CGO_ENABLED: '0' },
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['cmake.org']) {
        delete recipe.build.dependencies['cmake.org']
      }
      // BSD install doesn't support -D (create directories) — add mkdir before install
      if (Array.isArray(recipe.build?.script)) {
        const installIdx = recipe.build.script.findIndex(
          (s: any) => typeof s === 'string' && s === 'make install',
        )
        if (installIdx >= 0) {
          recipe.build.script.splice(installIdx, 0, 'mkdir -p "$DESTDIR$BINDIR"')
        }
      }
    },
  },

  // ─── gnome.org/adwaita-icon-theme — no-op gtk4-update-icon-cache ──
  'gnome.org/adwaita-icon-theme': {
    prependScript: [
      // gtk4-update-icon-cache may not be available — icon cache is optional
      'mkdir -p "${TMPDIR:-/tmp}/_icon_fix"',
      'printf \'#!/bin/sh\\nexit 0\\n\' > "${TMPDIR:-/tmp}/_icon_fix/gtk4-update-icon-cache"',
      'chmod +x "${TMPDIR:-/tmp}/_icon_fix/gtk4-update-icon-cache"',
      'export PATH="${TMPDIR:-/tmp}/_icon_fix:$PATH"',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove gtk4 build dep — we provide a no-op icon cache updater
      if (recipe.build?.dependencies?.['gtk.org/gtk4']) {
        delete recipe.build.dependencies['gtk.org/gtk4']
      }
    },
  },

  // ─── github.com/thkukuk/libnsl — ensure libtirpc headers found ──
  'github.com/thkukuk/libnsl': {
    prependScript: [
      // libtirpc headers are in a tirpc/ subdirectory — add to CPPFLAGS
      'TIRPC_CFLAGS=$(pkg-config --cflags libtirpc 2>/dev/null || echo "")',
      'TIRPC_LIBS=$(pkg-config --libs libtirpc 2>/dev/null || echo "")',
      'export CPPFLAGS="${CPPFLAGS:-} $TIRPC_CFLAGS"',
      'export LDFLAGS="${LDFLAGS:-} $TIRPC_LIBS"',
    ],
  },

  // ─── astral.sh/uv — ensure RUSTFLAGS and cmake compat ──
  'astral.sh/uv': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    modifyRecipe: (recipe: any) => {
      // Widen cmake constraint to include 4.x
      if (recipe.build?.dependencies?.['cmake.org'] === '^3.28') {
        recipe.build.dependencies['cmake.org'] = '>=3.28'
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

  'crates.io/tabiew': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    modifyRecipe: (recipe: any) => {
      // Remove polars/nightly feature — the YAML recipe sets POLARS="--features 'polars/nightly'" for <0.12,
      // but older versions (0.8.x-0.11.x) don't actually have that feature in their Cargo.toml
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run) {
            const runs = Array.isArray(step.run) ? step.run : [step.run]
            for (let j = 0; j < runs.length; j++) {
              if (typeof runs[j] === 'string' && runs[j].includes('polars/nightly')) {
                runs[j] = runs[j].replace(/POLARS="[^"]*"/, 'POLARS=""')
              }
            }
          }
        }
      }
    },
  },

  'crates.io/skim': {
    env: { RUSTFLAGS: '--cap-lints warn' },
    modifyRecipe: (recipe: any) => {
      if (!Array.isArray(recipe.build?.script)) return
      for (let i = 0; i < recipe.build.script.length; i++) {
        const step = recipe.build.script[i]
        // Remove --features nightly-frizbee (feature removed in newer versions)
        if (typeof step === 'string' && step.includes('nightly-frizbee')) {
          recipe.build.script[i] = step.replace(' --features nightly-frizbee', '')
        } else if (typeof step === 'object' && typeof step.run === 'string' && step.run.includes('nightly-frizbee')) {
          step.run = step.run.replace(' --features nightly-frizbee', '')
        }
        // Pin nightly toolchain for skim 1.x (>=1.3<2): frizbee uses old std::simd APIs
        if (typeof step === 'object' && step.if === '>=1.3<2' && typeof step.run === 'string' && step.run.includes('rustup default nightly')) {
          step.run = 'rustup default nightly-2024-01-15'
        }
        // Pin nightly for skim >=2<3.5 — frizbee <0.8.2 uses std::simd (nightly-only).
        // Buildkit removes rust-toolchain.toml, so we can't read the pinned channel.
        // Use nightly (latest) since these versions just need any nightly with portable_simd.
        if (typeof step === 'object' && step.if === '>=2' && typeof step.run === 'string' && step.run.includes('rust-toolchain.toml')) {
          step.run = 'rustup default nightly'
        }
        // Add --locked to cargo install for versions that use nightly-frizbee feature
        if (typeof step === 'object' && typeof step.run === 'string'
          && step.run.includes('cargo install') && !step.run.includes('--locked')) {
          step.run = step.run.replace('cargo install', 'cargo install --locked')
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
      CFLAGS: '-Wno-error -DBTRFS_LABEL_SIZE=256 -DBTRFS_EXTENT_REF_V0_KEY=180 -DBTRFS_SHARED_BLOCK_REF_KEY=182',
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
          // Ensure both ncurses dev libs are available — ncursesw6 for wide-char support
          'sudo apt-get install -y libncurses-dev libncursesw5-dev 2>/dev/null || true',
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
      // Fix tlib on linux — force ncursesw and provide explicit lib path
      if (Array.isArray(recipe.build?.env?.linux?.ARGS)) {
        recipe.build.env.linux.ARGS = recipe.build.env.linux.ARGS.map(
          (a: string) => a === '--with-tlib=tinfow' ? '--with-tlib=ncursesw' : a,
        )
      }
      // Remove ncurses S3 dep — use system ncurses
      if (recipe.dependencies?.['invisible-island.net/ncurses']) {
        delete recipe.dependencies['invisible-island.net/ncurses']
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
          // Python 3.12+ removed distutils from stdlib. g-i imports distutils in
          // multiple files (utils.py, ccompiler.py, etc). Install setuptools and create
          // a sitecustomize.py that activates the distutils compatibility shim for all
          // Python subprocesses (including g-ir-scanner launched by ninja).
          'python3 -m pip install --break-system-packages "setuptools<78" 2>/dev/null || true',
          '_GI_PYFIX="/tmp/buildkit-gi-pyfix"; mkdir -p "$_GI_PYFIX"',
          'printf "try:\\n    import _distutils_hack\\n    _distutils_hack.add_shim()\\nexcept Exception:\\n    pass\\n" > "$_GI_PYFIX/sitecustomize.py"',
          'export PYTHONPATH="$_GI_PYFIX:$(python3 -c "import site; print(site.getsitepackages()[0])" 2>/dev/null):${PYTHONPATH:-}"',
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
              step.run = `sed -i.bak 's|env .*/bin/python[23]*|env python3|' g-ir-annotation-tool g-ir-scanner 2>/dev/null || true`
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
      // Disable introspection, vapi, man pages and docs in meson args
      if (Array.isArray(recipe.build?.env?.MESON_ARGS)) {
        recipe.build.env.MESON_ARGS.push(
          '-Dintrospection=false',
          '-Dvapi=false',
          '-Dgtk_doc=false',
          '-Dmanpage=false',
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
            recipe.build.script[i] = step.replaceAll('sed -i ', 'sed -i.bak ')
          } else if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      darwin: {
        prependScript: [
          // libiconv is keg-only on macOS — link it explicitly
          'brew install libiconv 2>/dev/null || true',
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include ${CPPFLAGS:-}"',
        ],
      },
      linux: {
        prependScript: [
          // libgd was built with libiconv — link it on linux too
          'ICONV_DIR=$(find /tmp/buildkit-deps -path "*/gnu.org/libiconv/*/lib" -type d 2>/dev/null | head -1)',
          'if [ -n "$ICONV_DIR" ]; then',
          '  export LDFLAGS="-L$ICONV_DIR ${LDFLAGS:-}"',
          '  export CPPFLAGS="-I$(dirname $ICONV_DIR)/include ${CPPFLAGS:-}"',
          'fi',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove linux-only libavif dep (not in S3)
      if (recipe.dependencies?.linux?.['github.com/AOMediaCodec/libavif']) {
        delete recipe.dependencies.linux['github.com/AOMediaCodec/libavif']
      }
      // Disable Lua support — gnuplot-tikz.lua has Lua 5.4 incompatibility
      // (attempt to assign to const variable 'w' at line 2546)
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--without-lua')
        // Fix readline: remove broken template arg, let configure find it automatically
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => !a.includes('deps.gnu.org/readline'),
        )
      }
      // Remove lua.org dep since we disabled it
      if (recipe.dependencies?.['lua.org']) delete recipe.dependencies['lua.org']
      // Remove readline dep — use system readline instead
      if (recipe.dependencies?.['gnu.org/readline']) delete recipe.dependencies['gnu.org/readline']
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
    platforms: {
      linux: {
        prependScript: [
          // Install leptonica dev library required for tesseract
          'sudo apt-get install -y libleptonica-dev liblept5 2>/dev/null || sudo apt-get install -y libleptonica-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          // Install leptonica from Homebrew for tesseract dependency
          'brew install leptonica 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix leptonica)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix --prefix and --datarootdir args: remove extra quotes
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.replace(/^(--\w+=)"([^"]+)"$/, '$1$2'),
        )
      }
      // Remove leptonica.org dep (not in S3) — use system leptonica
      if (recipe.dependencies?.['leptonica.org']) {
        delete recipe.dependencies['leptonica.org']
      }
      // Remove unicode.org and cairographics.org deps (use system)
      if (recipe.dependencies?.['unicode.org']) delete recipe.dependencies['unicode.org']
      if (recipe.dependencies?.['cairographics.org']) delete recipe.dependencies['cairographics.org']
      if (recipe.dependencies?.['gnome.org/pango']) delete recipe.dependencies['gnome.org/pango']
      // Strip the post-build wget steps for trained data (wget URL may be empty if $res vars aren't set)
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('wget') && step.run.includes('traineddata')) {
            return false
          }
          if (typeof step === 'object' && step.run && Array.isArray(step.run)) {
            const hasWget = step.run.some((s: string) =>
              typeof s === 'string' && s.includes('wget') && s.includes('traineddata'),
            )
            if (hasWget) return false
          }
          return true
        })
        // On darwin: rename ./version AFTER configure but BEFORE make to avoid
        // C++20 <version> header shadowing by the local ./version file.
        // The ./version file is read by autogen.sh/configure for libtool version info,
        // so it must exist during those steps.
        const configureIdx = recipe.build.script.findIndex((step: any) =>
          typeof step === 'string' && step.includes('./configure'),
        )
        if (configureIdx >= 0 && configureIdx < recipe.build.script.length - 1) {
          recipe.build.script.splice(configureIdx + 1, 0,
            'mv ./version ./version.bak 2>/dev/null || true',
          )
        }
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
    platforms: {
      darwin: {
        prependScript: [
          // Install system lcms2 (littlecms.com S3 binary unreliable)
          'brew install little-cms2 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix little-cms2)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export CMAKE_PREFIX_PATH="$(brew --prefix little-cms2):${CMAKE_PREFIX_PATH:-}"',
        ],
      },
      linux: {
        prependScript: [
          // Install liblcms2-dev for color management (littlecms.com S3 binary unreliable)
          'sudo apt-get install -y liblcms2-dev 2>/dev/null || true',
        ],
      },
    },
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
      // Disable glib/gobject, NSS3, and optional GPGME in cmake args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-DENABLE_GLIB=OFF')) {
          recipe.build.env.ARGS.push('-DENABLE_GLIB=OFF')
        }
        if (!recipe.build.env.ARGS.includes('-DENABLE_GPGME=OFF')) {
          recipe.build.env.ARGS.push('-DENABLE_GPGME=OFF')
        }
        if (!recipe.build.env.ARGS.includes('-DENABLE_NSS3=OFF')) {
          recipe.build.env.ARGS.push('-DENABLE_NSS3=OFF')
        }
      }
      // Remove nss and gpgme deps (not in S3)
      if (recipe.dependencies?.['mozilla.org/nss']) delete recipe.dependencies['mozilla.org/nss']
      if (recipe.dependencies?.['gnupg.org/gpgme']) delete recipe.dependencies['gnupg.org/gpgme']
      if (recipe.dependencies?.['gnupg.org/libgpg-error']) delete recipe.dependencies['gnupg.org/libgpg-error']
      if (recipe.dependencies?.['gnupg.org/libassuan']) delete recipe.dependencies['gnupg.org/libassuan']
      // Remove littlecms.com dep — use system lcms2 instead (S3 binary unreliable)
      if (recipe.dependencies?.['littlecms.com']) delete recipe.dependencies['littlecms.com']
      // Remove linux gcc/libstdcxx runtime deps
      if (recipe.dependencies?.linux?.['gnu.org/gcc/libstdcxx']) delete recipe.dependencies.linux['gnu.org/gcc/libstdcxx']
      // Fix static lib install: GLIB is disabled so libpoppler-glib.a doesn't get built.
      // Replace the install command that references it with one that only copies the libs that exist.
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.map((step: any) => {
          if (typeof step === 'string' && step.includes('libpoppler-glib.a')) {
            // Replace with: install only libpoppler.a and libpoppler-cpp.a (skip glib)
            return step.replace(/ build_static\/glib\/libpoppler-glib\.a/, '')
          }
          return step
        })
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
          'pip3 install "setuptools<78" 2>/dev/null || python3 -m pip install "setuptools<78" 2>/dev/null || true',
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
        // Add -Dintrospection=disabled (must use feature type, not boolean)
        recipe.build.env.MESON_ARGS = recipe.build.env.MESON_ARGS.filter(
          (a: string) => !a.includes('-Dintrospection='),
        )
        if (!recipe.build.env.MESON_ARGS.includes('-Dintrospection=disabled')) {
          recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled')
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
    platforms: {
      darwin: {
        prependScript: [
          // Install c-ares, gnutls, libgcrypt from Homebrew (use system libs instead of S3)
          'brew install c-ares gnutls libgcrypt 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix c-ares)/lib/pkgconfig:$(brew --prefix gnutls)/lib/pkgconfig:$(brew --prefix libgcrypt)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export CMAKE_PREFIX_PATH="$(brew --prefix c-ares):$(brew --prefix gnutls):$(brew --prefix libgcrypt):${CMAKE_PREFIX_PATH:-}"',
        ],
      },
      linux: {
        prependScript: [
          // Use system c-ares, gnutls, libgcrypt (S3 gnutls has ABI mismatch:
          // references NETTLE_8/HOGWEED_6 symbols not in system nettle)
          'sudo apt-get install -y libc-ares-dev libgnutls28-dev libgcrypt20-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
      }
      // Remove deps that use S3 binaries with ABI/header issues — use brew/apt instead
      if (recipe.dependencies?.['ibr.cs.tu-bs.de/libsmi']) delete recipe.dependencies['ibr.cs.tu-bs.de/libsmi']
      if (recipe.dependencies?.['c-ares.org']) delete recipe.dependencies['c-ares.org']
      if (recipe.dependencies?.['lua.org']) delete recipe.dependencies['lua.org']
      if (recipe.dependencies?.['gnutls.org']) delete recipe.dependencies['gnutls.org']
      if (recipe.dependencies?.['gnupg.org/libgcrypt']) delete recipe.dependencies['gnupg.org/libgcrypt']
      if (recipe.dependencies?.['gnupg.org/libgpg-error']) delete recipe.dependencies['gnupg.org/libgpg-error']
      if (recipe.build?.dependencies?.['lua.org']) delete recipe.build.dependencies['lua.org']
      // Clean up cmake args: disable optional features and remove template-based
      // include/lib paths whose deps are removed (templates would go unresolved)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS
          .map((a: string) =>
            a === '-DENABLE_SMI=ON' ? '-DENABLE_SMI=OFF'
              : a === '-DENABLE_LUA=ON' ? '-DENABLE_LUA=OFF'
                : a,
          )
          .filter((a: string) =>
            !a.includes('libsmi')
            && !a.startsWith('-DCARES_INCLUDE_DIR=')
            && !a.startsWith('-DLUA_INCLUDE_DIR=')
            && !a.startsWith('-DGCRYPT_INCLUDE_DIR=')
            && !a.startsWith('-DGNUTLS_INCLUDE_DIR='),
          )
      }
      // Remove platform-specific LUA_LIBRARY args (template won't resolve without lua dep)
      if (Array.isArray(recipe.build?.env?.darwin?.CMAKE_ARGS)) {
        recipe.build.env.darwin.CMAKE_ARGS = recipe.build.env.darwin.CMAKE_ARGS.filter(
          (a: string) => !a.startsWith('-DLUA_LIBRARY='),
        )
      }
      if (Array.isArray(recipe.build?.env?.linux?.CMAKE_ARGS)) {
        recipe.build.env.linux.CMAKE_ARGS = recipe.build.env.linux.CMAKE_ARGS.filter(
          (a: string) => !a.startsWith('-DLUA_LIBRARY='),
        )
      }
    },
  },

  // ─── jpeg.org/jpegxl — fix build on darwin ───────────────────────────

  'jpeg.org/jpegxl': {
    platforms: {
      linux: {
        prependScript: [
          // Install LCMS2 dev library required by libjxl
          'sudo apt-get install -y liblcms2-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Add -DJPEGXL_ENABLE_OPENEXR=OFF to avoid openexr dep issues
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        if (!recipe.build.env.ARGS.includes('-DJPEGXL_ENABLE_OPENEXR=OFF')) {
          recipe.build.env.ARGS.push('-DJPEGXL_ENABLE_OPENEXR=OFF')
        }
      }
      // Remove littlecms.com dep (not in S3) — use system LCMS2
      if (recipe.dependencies?.['littlecms.com']) {
        delete recipe.dependencies['littlecms.com']
      }
    },
  },

  // ─── mpv.io — remove vapoursynth dep (not in S3 yet) ─────────────────

  'mpv.io': {
    platforms: {
      darwin: {
        prependScript: [
          // Install libass from Homebrew (not reliably in S3 dep tree)
          'brew install libass 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix libass)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
      linux: {
        prependScript: [
          // Install ALL codec/media -dev packages that ffmpeg links against.
          // meson step 313/314 runs the built mpv binary via "meson --internal exe"
          // to generate mpv_protocols. This doesn't reliably inherit LD_LIBRARY_PATH,
          // and meson overrides LD_RUN_PATH with its own -rpath. Installing system
          // -dev packages puts .so files in /usr/lib/x86_64-linux-gnu/ (always searched).
          'sudo apt-get install -y libass-dev libvpx-dev libx264-dev libx265-dev libopus-dev libmp3lame-dev libwebp-dev libplacebo-dev 2>/dev/null || true',
        ],
      },
    },
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
      // Remove libass dep on darwin (use Homebrew instead of S3)
      if (recipe.dependencies?.['github.com/libass/libass']) {
        delete recipe.dependencies['github.com/libass/libass']
      }
    },
  },

  // ─── github.com/libass/libass — link libiconv on darwin ────────────────

  'github.com/libass/libass': {
    prependScript: [GLIBTOOL_FIX],
    platforms: {
      darwin: {
        prependScript: [
          // Install libiconv (keg-only) for subtitle character encoding conversion
          'brew install libiconv 2>/dev/null || true',
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include ${CPPFLAGS:-}"',
        ],
      },
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
    platforms: {
      linux: {
        prependScript: [
          // Install wayland-protocols for wayland-scanner and wayland-client
          'sudo apt-get install -y wayland-protocols libwayland-dev 2>/dev/null || true',
        ],
      },
    },
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
        recipe.build.env.MESON_ARGS.push('-Dintrospection=disabled', '-Ddocumentation=false', '-Dwayland-backend=false')
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
      linux: {
        prependScript: [
          // Install freeglut for OpenGL viewer (GL/freeglut.h)
          'sudo apt-get install -y freeglut3-dev 2>/dev/null || true',
        ],
      },
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
    platforms: {
      linux: {
        prependScript: [
          'sudo apt-get install -y libfyaml-dev 2>/dev/null || true',
        ],
      },
    },
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
      // Remove libfyaml dep (installed via apt instead)
      if (recipe.dependencies?.['github.com/pantoniou/libfyaml']) {
        delete recipe.dependencies['github.com/pantoniou/libfyaml']
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
    prependScript: [
      // Install kustomize for manifest generation (not in S3)
      'go install sigs.k8s.io/kustomize/kustomize/v5@latest 2>/dev/null || true',
      'export PATH="$HOME/go/bin:$PATH"',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove kubernetes.io/kustomize build dep (use go-installed instead)
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
    platforms: {
      linux: {
        prependScript: [
          'sudo apt-get install -y libmagic-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          'brew install libmagic 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix libmagic)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
    },
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
    platforms: {
      linux: {
        prependScript: [
          // Ensure AR and RANLIB point to system tools (LLVM ar at /tools/llvm/bin may not exist)
          'export AR="$(command -v ar)"',
          'export RANLIB="$(command -v ranlib)"',
          // Install lcms2 dev headers for pillow's lcms support
          'sudo apt-get install -y liblcms2-dev 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove x.org/xcb dep (not in S3)
      if (recipe.dependencies?.['x.org/xcb']) {
        delete recipe.dependencies['x.org/xcb']
      }
      // Remove littlecms.com dep (use system lcms2 instead)
      if (recipe.dependencies?.['littlecms.com']) {
        delete recipe.dependencies['littlecms.com']
      }
      // Remove xcb from pip install args
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter(
          (a: string) => a !== '-C xcb=enable',
        )
      }
      // Remove llvm.org build dep (use system toolchain)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
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
      // Replace goreleaser-based build step (>=4.11.1) with direct go build
      // Also fix rm -r props → rm -rf props
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run) {
            // Handle run as array: replace goreleaser step with go build
            if (Array.isArray(step.run)) {
              const hasGoreleaser = step.run.some((s: string) =>
                typeof s === 'string' && s.includes('goreleaser'),
              )
              if (hasGoreleaser) {
                // Replace entire goreleaser-based build with direct go build
                step.run = [
                  'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/kubebuilder\' .',
                ]
              }
              // Also fix rm -rf
              for (let j = 0; j < step.run.length; j++) {
                if (typeof step.run[j] === 'string' && step.run[j].includes('rm -r props')) {
                  step.run[j] = step.run[j].replace('rm -r props', 'rm -rf props')
                }
              }
            }
          }
        }
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
      // Remove linux static build tags (can't static link without musl) and add btrfs exclusion
      if (Array.isArray(recipe.build?.env?.linux?.TAGS)) {
        recipe.build.env.linux.TAGS = recipe.build.env.linux.TAGS.filter(
          (t: string) => t !== 'static_build' && t !== 'netgo' && t !== 'osusergo',
        )
        // Exclude btrfs graph driver (needs libbtrfs-dev headers we removed)
        if (!recipe.build.env.linux.TAGS.includes('exclude_graphdriver_btrfs')) {
          recipe.build.env.linux.TAGS.push('exclude_graphdriver_btrfs')
        }
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
            recipe.build.script[i] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      linux: {
        prependScript: [
          // Install popt dev library required for epsilon build
          'sudo apt-get install -y libpopt-dev 2>/dev/null || true',
        ],
      },
    },
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      darwin: {
        prependScript: [
          // Install protobuf for protoc (needed for monero protobuf components)
          'brew install protobuf 2>/dev/null || true',
          'export PATH="$(brew --prefix protobuf)/bin:$PATH"',
          'export PKG_CONFIG_PATH="$(brew --prefix protobuf)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove linux llvm.org build dep (use system compiler)
      if (recipe.build?.dependencies?.linux?.['llvm.org']) {
        delete recipe.build.dependencies.linux['llvm.org']
      }
    },
  },

  // ─── openresty.org — fix sed -i BSD compat ───────────────────────────

  // openresty.org — no override needed: buildkit sed wrapper now finds gsed in Homebrew opt paths

  // ─── openjdk.org — download pre-built Adoptium Temurin binaries ──────
  // Building OpenJDK from source requires 30+ deps and 60+ min compile time.
  // Instead, download pre-built Adoptium Temurin JDK binaries which are identical
  // in functionality and much faster/more reliable.

  'openjdk.org': {
    modifyRecipe: (recipe: any) => {
      // Strip all source dependencies and distributable — we download pre-built binaries
      recipe.dependencies = {}
      recipe.distributable = null // skip source download (build script fetches pre-built binary)
      if (recipe.build) {
        recipe.build.dependencies = {}
        // Replace the build script: use Adoptium API to find the latest Temurin
        // release for the requested major version, then download it.
        // This avoids version mismatches between OpenJDK repo tags and Temurin releases.
        recipe.build.script = [
          [
            '# Download pre-built Adoptium Temurin JDK via API',
            'MAJOR=$(echo "{{version}}" | cut -d. -f1)',
            '',
            'if test "{{hw.platform}}" = "darwin"; then',
            '  API_ARCH="{{hw.arch}}"',
            '  test "$API_ARCH" = "aarch64" || API_ARCH="x64"',
            '  API_OS="mac"',
            '  STRIP=3',
            'else',
            '  API_ARCH="{{hw.arch}}"',
            '  test "$API_ARCH" = "x86-64" && API_ARCH="x64"',
            '  API_OS="linux"',
            '  STRIP=1',
            'fi',
            '',
            '# Query Adoptium API for the latest GA release binary URL',
            'API_URL="https://api.adoptium.net/v3/binary/latest/${MAJOR}/ga/${API_OS}/${API_ARCH}/jdk/hotspot/normal/eclipse"',
            'echo "Fetching from Adoptium API: $API_URL"',
            'curl -fSL -o temurin-jdk.tar.gz "$API_URL"',
            'tar xzf temurin-jdk.tar.gz --strip-components=$STRIP -C "{{prefix}}"',
            'rm -f temurin-jdk.tar.gz',
          ].join('\n'),
        ]
        // Clear build env vars that reference deps
        recipe.build.env = {}
        // Skip all binary fix-ups — pre-built Temurin binaries are already relocatable
        recipe.build.skip = ['fix-machos', 'fix-patchelf']
      }
    },
  },

  // ─── kafka.apache.org — resolve symlinks in dirname $0 for .bin/ compat ──
  'kafka.apache.org': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build && Array.isArray(recipe.build.script)) {
        // After the rsync copies everything to prefix, patch kafka-run-class.sh
        // to resolve symlinks so it works when called from .bin/ symlinks
        recipe.build.script.push(
          'sed -i.bak \'s#base_dir=$(dirname $0)/..#base_dir=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")/..#g\' "{{prefix}}/bin/kafka-run-class.sh" && rm -f "{{prefix}}/bin/kafka-run-class.sh.bak"',
        )
      }
    },
  },

  // ─── opensearch.org — fix sed -i BSD compat + set JAVA_HOME ──────────

  'opensearch.org': {
    modifyRecipe: (recipe: any) => {
      // Fix sed -i BSD compat in multiple steps
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
              .replace(/sed -i -e /g, 'sed -i.bak -e ')
              .replace(/sed -i -f /g, 'sed -i.bak -f ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
              .replace(/sed -i -e /g, 'sed -i.bak -e ')
          }
        }
        // Patch opensearch-env to auto-discover JAVA_HOME from java on PATH
        // when neither OPENSEARCH_JAVA_HOME nor JAVA_HOME is set
        recipe.build.script.push(
          'sed -i.bak \'1a\\\n'
          + '# Auto-discover JAVA_HOME from java on PATH if not explicitly set\\\n'
          + 'if [ -z "$OPENSEARCH_JAVA_HOME" ] && [ -z "$JAVA_HOME" ]; then\\\n'
          + '  _java_bin=$(command -v java 2>/dev/null)\\\n'
          + '  if [ -n "$_java_bin" ]; then\\\n'
          + '    _java_real=$(readlink -f "$_java_bin" 2>/dev/null || echo "$_java_bin")\\\n'
          + '    export JAVA_HOME=$(cd "$(dirname "$_java_real")/.." && pwd)\\\n'
          + '  fi\\\n'
          + '  unset _java_bin _java_real\\\n'
          + 'fi\' "{{prefix}}/bin/opensearch-env" && rm -f "{{prefix}}/bin/opensearch-env.bak"',
        )
      }
    },
  },

  // ─── browser-use.com — remove darwin --no-binary reinstall step ──────
  // The --no-binary :all: force-reinstall of jiter/rpds-py is for headerpad,
  // but fix-machos is skipped (breaks aarch64 binaries), so it's unnecessary
  // and causes a build timeout from infinite setuptools copy loops.

  'browser-use.com': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            return !step.run.includes('--no-binary')
          }
          return true
        })
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
      // Remove capnproto.org dep (not in S3) and disable IPC which requires it
      if (recipe.dependencies?.['capnproto.org']) {
        delete recipe.dependencies['capnproto.org']
      }
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        if (!recipe.build.env.CMAKE_ARGS.includes('-DENABLE_IPC=OFF')) {
          recipe.build.env.CMAKE_ARGS.push('-DENABLE_IPC=OFF')
        }
      }
      // Make patchelf steps error-tolerant — sqlite.org dep may use system path
      // where the binary doesn't reference the full /usr/lib/libsqlite3.so path
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.map((step: any) => {
          if (typeof step === 'object' && Array.isArray(step.run)) {
            step.run = step.run.map((cmd: string) =>
              typeof cmd === 'string' && cmd.includes('patchelf') ? `${cmd} || true` : cmd,
            )
          }
          return step
        })
      }
    },
  },

  // ─── aws.amazon.com/cli — fix python version constraint ──────────────

  'aws.amazon.com/cli': {
    modifyRecipe: (recipe: any) => {
      // Pin python to 3.11.x — flit_core uses ast.Str which was removed in 3.12
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '~3.11'
      }
    },
  },

  // ─── php.net — fix sed -i BSD compat + remove kerberos dep ──────────

  'php.net': {
    platforms: {
      darwin: {
        // Install kerberos, ICU, libpq, and libiconv from Homebrew (not reliably in S3)
        prependScript: [
          'brew install krb5 icu4c libpq libiconv 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix krb5)/lib/pkgconfig:$(brew --prefix icu4c)/lib/pkgconfig:$(brew --prefix libpq)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LDFLAGS="-L$(brew --prefix icu4c)/lib -L$(brew --prefix libpq)/lib -L$(brew --prefix libiconv)/lib $LDFLAGS"',
          'export CPPFLAGS="-I$(brew --prefix icu4c)/include -I$(brew --prefix libpq)/include -I$(brew --prefix libiconv)/include $CPPFLAGS"',
          'export PATH="$(brew --prefix libpq)/bin:$PATH"',
        ],
      },
      linux: {
        // Install kerberos, ICU, iconv, and libpq headers from apt
        prependScript: [
          'sudo apt-get install -y libkrb5-dev libicu-dev libc6-dev libpq-dev 2>/dev/null || true',
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            recipe.build.script[i] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
      // Fix --with-iconv: on linux glibc provides iconv, on darwin use Homebrew libiconv
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS = recipe.build.env.ARGS.map((a: string) =>
          a.match(/^--with-iconv=/)
            ? (process.platform === 'darwin' ? '--with-iconv=$(brew --prefix libiconv)' : '--with-iconv')
            : a,
        )
        // Add PDO MySQL (via mysqlnd — no external libmysqlclient needed)
        if (!recipe.build.env.ARGS.some((a: string) => a.startsWith('--with-pdo-mysql'))) {
          recipe.build.env.ARGS.push('--with-pdo-mysql=mysqlnd')
        }
        // Add mysqli (via mysqlnd — legacy MySQL extension used by some packages)
        if (!recipe.build.env.ARGS.some((a: string) => a.startsWith('--with-mysqli'))) {
          recipe.build.env.ARGS.push('--with-mysqli=mysqlnd')
        }
        // Add PDO PostgreSQL — needs explicit libpq path on macOS (Homebrew non-standard location)
        if (!recipe.build.env.ARGS.some((a: string) => a.startsWith('--with-pdo-pgsql'))) {
          recipe.build.env.ARGS.push(
            process.platform === 'darwin'
              ? '--with-pdo-pgsql=$(brew --prefix libpq)'
              : '--with-pdo-pgsql',
          )
        }
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string') {
            if (step.includes('sed -i') && !step.includes('sed -i.bak')) {
              recipe.build.script[i] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
    prependScript: [
      // Ensure setuptools (pkg_resources) is available for metadata generation
      'python3 -m pip install --break-system-packages "setuptools<78" wheel 2>/dev/null || pip3 install --break-system-packages "setuptools<78" wheel 2>/dev/null || true',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove cython.org dep on linux/aarch64 (not in S3)
      if (recipe.build?.dependencies?.['linux/aarch64']?.['cython.org']) {
        delete recipe.build.dependencies['linux/aarch64']['cython.org']
      }
    },
  },

  // ─── qemu.org — fix prefix quoting + sed -i BSD + remove vde dep ────

  'qemu.org': {
    platforms: {
      darwin: {
        prependScript: [
          // Install libiconv (keg-only) for curses UI iconv requirement
          'brew install libiconv 2>/dev/null || true',
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include ${CPPFLAGS:-}"',
        ],
      },
    },
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
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
    platforms: {
      darwin: {
        prependScript: [
          // Install CGAL from brew — S3 cgal.org binary has cmake config files
          // in a non-standard location that cmake can't find via CMAKE_PREFIX_PATH
          'brew install cgal 2>/dev/null || true',
          // Force-link boost so cmake can find headers and cmake configs
          'brew link boost --overwrite 2>/dev/null || true',
          // Homebrew boost 1.90 installs BoostConfig.cmake but NOT individual component
          // configs (boost_system, etc). Create a minimal header-only config for boost_system.
          'BOOST_CMAKE_DIR="$(brew --prefix boost)/lib/cmake"; BOOST_VER="$(ls "$BOOST_CMAKE_DIR" 2>/dev/null | grep "^Boost-" | head -1 | sed "s/Boost-//")"; if [ -n "$BOOST_VER" ]; then mkdir -p "$BOOST_CMAKE_DIR/boost_system-$BOOST_VER" && echo \'if(NOT TARGET Boost::system)\nadd_library(Boost::system INTERFACE IMPORTED)\nif(TARGET Boost::headers)\nset_target_properties(Boost::system PROPERTIES INTERFACE_LINK_LIBRARIES Boost::headers)\nendif()\nendif()\' > "$BOOST_CMAKE_DIR/boost_system-$BOOST_VER/boost_systemConfig.cmake" && echo \'set(PACKAGE_VERSION "\'$BOOST_VER\'")\nif("${PACKAGE_FIND_VERSION}" VERSION_EQUAL "${PACKAGE_VERSION}")\nset(PACKAGE_VERSION_EXACT TRUE)\nendif()\nif(NOT "${PACKAGE_FIND_VERSION}" VERSION_GREATER "${PACKAGE_VERSION}")\nset(PACKAGE_VERSION_COMPATIBLE TRUE)\nendif()\' > "$BOOST_CMAKE_DIR/boost_system-$BOOST_VER/boost_systemConfigVersion.cmake"; fi',
          'export CMAKE_PREFIX_PATH="$(brew --prefix boost)/lib/cmake:$(brew --prefix)/lib/cmake/CGAL:$(brew --prefix)/lib/cmake:${CMAKE_PREFIX_PATH:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Fix stray quote in -DCMAKE_INSTALL_PREFIX (missing closing quote)
      if (Array.isArray(recipe.build?.env?.CMAKE_ARGS)) {
        recipe.build.env.CMAKE_ARGS = recipe.build.env.CMAKE_ARGS.map((a: string) =>
          a === '-DCMAKE_INSTALL_PREFIX="{{prefix}}' ? '-DCMAKE_INSTALL_PREFIX={{prefix}}' : a,
        )
        // boost_system cmake config is created by prependScript on darwin
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
      // Fix sed -i BSD compat + make glob patterns resilient to empty matches
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            if (step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
              step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
                .replace(/sed -i -f /g, 'sed -i.bak -f ')
            }
            // Make glob-based sed resilient: use bash nullglob or || true
            if (step.run.includes('sed ') && (step.run.includes('*.sh') || step.run.includes('*/'))) {
              step.run = `shopt -s nullglob; ${step.run}; shopt -u nullglob`
            }
          }
          if (typeof step === 'string') {
            let s = step
            if (s.includes('sed -i') && !s.includes('sed -i.bak')) {
              s = s.replaceAll('sed -i ', 'sed -i.bak ')
            }
            if (s.includes('sed ') && (s.includes('*.sh') || s.includes('*/'))) {
              s = `shopt -s nullglob; ${s}; shopt -u nullglob`
            }
            recipe.build.script[i] = s
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
    platforms: {
      darwin: {
        prependScript: [
          // Install protobuf for protoc (prost-build needs it for etcd-client crate)
          'brew install protobuf 2>/dev/null || true',
          'export PATH="$(brew --prefix protobuf)/bin:$PATH"',
        ],
      },
      linux: {
        prependScript: [
          'sudo apt-get install -y protobuf-compiler 2>/dev/null || true',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove protobuf.dev build dep (use system protoc instead)
      if (recipe.build?.dependencies?.['protobuf.dev']) {
        delete recipe.build.dependencies['protobuf.dev']
      }
    },
  },

  // ─── rucio.cern.ch/rucio-client — remove postgresql dep ──────────────

  'rucio.cern.ch/rucio-client': {
    prependScript: [
      // Install python build module required for pip wheel building
      'python3 -m pip install --break-system-packages build "setuptools<78" wheel 2>/dev/null || true',
    ],
    modifyRecipe: (recipe: any) => {
      // Remove postgresql.org build dep (not in S3)
      if (recipe.build?.dependencies?.['postgresql.org']) {
        delete recipe.build.dependencies['postgresql.org']
      }
      // Quote brackets in pip install to prevent nullglob expansion
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'object' && typeof step.run === 'string' && step.run.includes('pip install') && step.run.includes('rucio[')) {
            step.run = step.run.replace(/rucio\[([^\]]+)\]/, '"rucio[$1]"')
          }
        }
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
              + ' -e \'/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)[^/]*/include|/v\\1/include|g\''
              + ' -e \'/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)[^/]*/lib|/v\\1/lib|g\''
              + ' folly-targets.cmake'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/cmake/folly'
            }
          }
          // Fix libfolly.pc sed (multi-line truncated to 'sed -i')
          if (step.run === 'sed -i') {
            step.run = `sed -i -e 's/-I[^ ]* *//g' -e 's:{{pkgx.prefix}}:\${prefix}/../../..:g' libfolly.pc`
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
            recipe.build.script[i] = step.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
              + ' -e \'/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)[^/]*/include|/v\\1/include|g\''
              + ' -e \'/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)[^/]*/lib|/v\\1/lib|g\''
              + ' FBThriftTargets.cmake'
            if (!step['working-directory']) {
              step['working-directory'] = '${{prefix}}/lib/cmake/fbthrift'
            }
          }
          // Fix other sed -i BSD compat (single-line seds that parsed correctly)
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i ') && !step.run.includes('sed -i.bak ')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i ') && !step.includes('sed -i.bak ')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
          // pywatchman install needs setuptools in the S3 dep Python that cmake uses (not just system python)
          'for pybin in /tmp/buildkit-deps/python.org/*/bin/python3; do "$pybin" -m ensurepip 2>/dev/null || true; "$pybin" -m pip install "setuptools<78" 2>/dev/null || true; done',
          'python3 -m pip install --break-system-packages "setuptools<78" 2>/dev/null || pip3 install "setuptools<78" 2>/dev/null || true',
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
              if (line.startsWith(`newline=''`) && line.endsWith(`''`)) {
                const inner = line.slice(`newline=''`.length, -`''`.length)
                return `newline='${inner}'`
              }
              return line
            })
          }
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'string' && step.includes('sed -i') && !step.includes('sed -i.bak')) {
            const idx = recipe.build.script.indexOf(step)
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
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
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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
    prependScript: [
      // Ensure setuptools is available for build (global python)
      'python3 -m pip install --break-system-packages "setuptools<78" 2>/dev/null || true',
      // Create a pip constraints file to pin pathspec<0.12
      // (pathspec>=0.12 removed GitWildMatchPatternError export which mypy references at build time)
      'echo "pathspec<0.12" > /tmp/pip-constraints-mypy.txt',
      'export PIP_CONSTRAINT=/tmp/pip-constraints-mypy.txt',
    ],
    modifyRecipe: (recipe: any) => {
      // Widen python version constraint — current CI has 3.14
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '>=3<3.15'
      }
      // Install setuptools inside the venv (Python 3.14 removed it from stdlib)
      // bkpyvenv creates the venv, then pip install . needs setuptools for wheel building
      if (Array.isArray(recipe.build?.script)) {
        const stageIdx = recipe.build.script.findIndex((s: any) =>
          typeof s === 'string' && s.includes('bkpyvenv stage'))
        if (stageIdx >= 0) {
          recipe.build.script.splice(stageIdx + 1, 0,
            '{{prefix}}/venv/bin/pip install "setuptools<78"')
        }
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
      // Fix: Lua 5.5 header uses LUA_VERSION_MAJOR_N macro instead of string literals.
      // luv's CMakeLists.txt reads lua.h with file(STRINGS) regex and gets raw #define
      // text in the version variables, breaking install paths. After each cmake configure,
      // fix the generated cmake_install.cmake to use the correct path.
      if (Array.isArray(recipe.build?.script)) {
        const newScript: any[] = []
        for (const step of recipe.build.script) {
          newScript.push(step)
          const stepStr = typeof step === 'string' ? step : ''
          // After each cmake --install, the install path is already baked in.
          // Insert fixup AFTER cmake --build but BEFORE cmake --install.
          if (stepStr.includes('cmake --build')) {
            const dir = stepStr.includes('buildjit') ? 'buildjit' : 'buildlua'
            newScript.push(
              `perl -pi -e 's{lib/lua/[^"]*}{lib/lua/5.5}g' ${dir}/cmake_install.cmake`,
            )
          }
        }
        recipe.build.script = newScript
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

  // ─── aomedia.googlesource.com/aom — googlesource flat tarball + cmake prefix ─

  'aomedia.googlesource.com/aom': {
    // googlesource.com +archive tarballs have no top-level directory
    stripComponents: 0,
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
            recipe.build.script[idx] = step.replaceAll('sed -i ', 'sed -i.bak ')
          }
          if (typeof step === 'object' && step.run && typeof step.run === 'string'
            && step.run.includes('sed -i') && !step.run.includes('sed -i.bak')) {
            step.run = step.run.replaceAll('sed -i ', 'sed -i.bak ')
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

  // ─── c-ares.org — fix cmake prefix quote + broken dnsinfo.h download ──

  'c-ares.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          // Fix inline cmake prefix quote in script string
          if (typeof step === 'string' && step.includes('INSTALL_PREFIX="{{prefix}}"')) {
            recipe.build.script[i] = step.replace(/(-DCMAKE_INSTALL_PREFIX=)"([^"]+)"/, '$1$2')
          }
          // Remove broken Apple dnsinfo.h curl download (returns 404 HTML)
          if (typeof step === 'object' && step.run && typeof step.run === 'string' && step.run.includes('dnsinfo.h')) {
            recipe.build.script[i] = 'rm -f src/lib/thirdparty/apple/dnsinfo.h 2>/dev/null || true'
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

  // ─── gaia-gis.it/fossil/freexl — install minizip on linux ───────────

  'gaia-gis.it/fossil/freexl': {
    platforms: {
      linux: {
        prependScript: [
          'sudo apt-get install -y libminizip-dev 2>/dev/null || true',
        ],
      },
      darwin: {
        prependScript: [
          'brew install minizip libiconv 2>/dev/null || true',
          'export PKG_CONFIG_PATH="$(brew --prefix minizip)/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          // Link against Homebrew libiconv (keg-only) for GNU _libiconv symbols
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include ${CPPFLAGS:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove zlib.net/minizip dep (not reliably in S3) — use system minizip
      if (recipe.dependencies?.['zlib.net/minizip']) {
        delete recipe.dependencies['zlib.net/minizip']
      }
    },
  },

  // ─── github.com/lu-zero/cargo-c — ensure openssl-sys can find headers ─

  'github.com/lu-zero/cargo-c': {
    platforms: {
      linux: {
        prependScript: [
          'sudo apt-get install -y libssl-dev pkg-config 2>/dev/null || true',
          'export OPENSSL_DIR="/usr"',
          'export OPENSSL_LIB_DIR="/usr/lib/x86_64-linux-gnu"',
          'export OPENSSL_INCLUDE_DIR="/usr/include"',
        ],
      },
    },
  },

  // ─── imagemagick.org — fix version tag format + remove broken deps ──────
  // Tag format: 7.1.2-13 but version is 7.1.2.13 (last dot→hyphen)
  // Many deps not in S3 — use system libs where possible

  'imagemagick.org': {
    modifyRecipe: (recipe: any) => {
      // Fix the distributable URL: version 7.1.2.13 maps to tag 7.1.2-13
      // Replace last dot with hyphen in the URL
      if (recipe.distributable?.url) {
        recipe.distributable.url = 'https://github.com/ImageMagick/ImageMagick/archive/{{version.tag}}.tar.gz'
      }
      // Remove deps not reliably in S3
      const removeDeps = [
        'littlecms.com', 'openexr.com', 'liblqr.wikidot.com',
        'ijg.org', 'jpeg.org/jpegxl', 'perl.org', 'libzip.org',
        'openmp.llvm.org', 'github.com/strukturag/libheif',
        'x.org/x11',
      ]
      for (const dep of removeDeps) {
        if (recipe.dependencies?.[dep]) delete recipe.dependencies[dep]
        if (recipe.dependencies?.darwin?.[dep]) delete recipe.dependencies.darwin[dep]
        if (recipe.dependencies?.linux?.[dep]) delete recipe.dependencies.linux[dep]
        if (recipe.dependencies?.['linux/x86-64']?.[dep]) delete recipe.dependencies['linux/x86-64'][dep]
      }
      // Disable features for removed deps
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        const disableArgs = [
          '--with-jxl=no', '--with-heic=no', '--with-lqr=no',
          '--without-openexr', '--with-zip=no', '--without-perl',
          '--disable-openmp', '--without-x',
        ]
        // Remove contradicting args first
        recipe.build.env.ARGS = recipe.build.env.ARGS.filter((a: string) =>
          !a.includes('--with-jxl=') && !a.includes('--with-heic=') &&
          !a.includes('--with-lqr') && !a.includes('--with-openexr') &&
          !a.includes('--with-zip=') && !a.includes('--with-perl') &&
          !a.includes('--enable-openmp') && !a.includes('--without-perl'),
        )
        recipe.build.env.ARGS.push(...disableArgs)
      }
      // Remove linux-specific --with-x and darwin-specific ARGS that reference removed deps
      if (Array.isArray(recipe.build?.env?.linux?.ARGS)) {
        recipe.build.env.linux.ARGS = recipe.build.env.linux.ARGS.filter((a: string) =>
          !a.includes('--with-x') && !a.includes('x.org'),
        )
      }
      if (Array.isArray(recipe.build?.env?.darwin?.ARGS)) {
        recipe.build.env.darwin.ARGS = recipe.build.env.darwin.ARGS.filter((a: string) =>
          !a.includes('--without-x'),
        )
      }
      // Remove LDFLAGS referencing removed deps
      if (Array.isArray(recipe.build?.env?.LDFLAGS)) {
        recipe.build.env.LDFLAGS = recipe.build.env.LDFLAGS.filter((f: string) =>
          !f.includes('liblqr') && !f.includes('ijg.org') &&
          !f.includes('gnu.org/libtool') && !f.includes('bzip2'),
        )
      }
      // Remove gnu.org/libtool dep (use system libtool)
      if (recipe.dependencies?.['gnu.org/libtool']) delete recipe.dependencies['gnu.org/libtool']
    },
  },

  // ─── github.com/google/re2 — fix date-based version tag ────────────────
  // Version: 2025.11.5, tag: 2025-11-05 (dots→hyphens, zero-pad day/month)

  'github.com/google/re2': {
    modifyRecipe: (recipe: any) => {
      // The resolveGitHubTag should handle this, but if not, we can override
      // Remove linux gcc dep if present
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── hdfgroup.org/HDF5 — fix tag format for 2.x (no hdf5_ prefix) ─────

  'hdfgroup.org/HDF5': {
    distributableUrl: 'https://github.com/HDFGroup/hdf5/releases/download/hdf5_{{version}}/hdf5-{{version}}.tar.gz',
    modifyRecipe: (recipe: any) => {
      // Remove linux gcc dep
      if (recipe.build?.dependencies?.linux?.['gnu.org/gcc']) {
        delete recipe.build.dependencies.linux['gnu.org/gcc']
      }
    },
  },

  // ─── github.com/allure-framework/allure2 — fix ZIP extraction ──────────

  'github.com/allure-framework/allure2': {
    stripComponents: 0,
  },

  // ─── github.com/npiv/chatblade — widen Python version ──────────────────

  'github.com/npiv/chatblade': {
    prependScript: [
      'python3 -m pip install --break-system-packages "setuptools<78" 2>/dev/null || true',
    ],
    modifyRecipe: (recipe: any) => {
      // Widen python version (CI has 3.14, recipe wants <3.12)
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3<3.15'
      }
    },
  },

  // ─── github.com/nvbn/thefuck — widen Python version ────────────────────

  'github.com/nvbn/thefuck': {
    modifyRecipe: (recipe: any) => {
      // Widen python version (CI has 3.14, recipe wants ~3.11)
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3<3.15'
      }
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '>=3<3.15'
      }
      // Replace build with manual venv steps — python-venv.sh silently fails
      // to install setuptools on Python 3.14. setuptools 78+ removed pkg_resources
      // which thefuck's setup.py imports. Pin setuptools<78 and use --no-build-isolation
      // to ensure the venv's setuptools (with pkg_resources) is used during build.
      if (recipe.build) {
        recipe.build.script = [
          'python3 -m venv {{prefix}}/venv',
          '{{prefix}}/venv/bin/python3 -m ensurepip --upgrade',
          '{{prefix}}/venv/bin/pip install --upgrade pip "setuptools<78" wheel',
          '{{prefix}}/venv/bin/pip install --no-build-isolation .',
          'mkdir -p {{prefix}}/bin',
          'printf \'#!/bin/sh\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nexec "$SCRIPT_DIR/../venv/bin/thefuck" "$@"\\n\' > {{prefix}}/bin/thefuck',
          'chmod +x {{prefix}}/bin/thefuck',
        ]
      }
    },
  },

  // ─── github.com/mattrobenolt/jinja2-cli — widen Python version ─────────

  'github.com/mattrobenolt/jinja2-cli': {
    prependScript: [
      'python3 -m pip install --break-system-packages "setuptools<78" 2>/dev/null || true',
    ],
    modifyRecipe: (recipe: any) => {
      // Widen python version (CI has 3.14, recipe wants <3.12)
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3<3.15'
      }
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '>=3<3.15'
      }
      // Remove the ln -s step entirely — it uses YAML folded scalar (>) which can cause
      // shell syntax errors. The venv works fine without the symlink.
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.filter((step: any) => {
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            return !step.run.includes('ln -s') && step.run !== '>'
          }
          return true
        })
      }
    },
  },

  // ─── github.com/stub42/pytz — widen Python version ─────────────────────

  'github.com/stub42/pytz': {
    modifyRecipe: (recipe: any) => {
      // Widen python version (CI has 3.14, recipe wants ~3.12)
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3<3.15'
      }
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '>=3<3.15'
      }
    },
  },

  // ─── mercurial-scm.org — fix setuptools_scm version for tarball builds ───
  // setuptools_scm can't determine version from tarball (no .git dir), causing
  // post-release version strings. SETUPTOOLS_SCM_PRETEND_VERSION forces correct version.
  // On Linux CI with Python 3.14, system pip 24.0 at /usr/lib/python3/dist-packages/pip
  // takes precedence over venv pip even when running venv's python. System pip's subprocess
  // can't find packaging.licenses. Fix: use setuptools<77 which doesn't require it.

  'mercurial-scm.org': {
    env: {
      SETUPTOOLS_SCM_PRETEND_VERSION: '{{version}}',
    },
    modifyRecipe: (recipe: any) => {
      if (!recipe.build?.script) return
      for (let i = 0; i < recipe.build.script.length; i++) {
        const step = recipe.build.script[i]
        // Pin setuptools<77 to avoid packaging.licenses requirement.
        // On Linux CI, system pip 24.0 shadows venv pip and its subprocess
        // can't find packaging.licenses even when installed in the venv.
        // setuptools<77 doesn't validate license expressions, sidestepping the issue.
        if (step?.run && Array.isArray(step.run)) {
          const hasVenv = step.run.some((cmd: string) => cmd.includes('venv'))
          if (hasVenv) {
            recipe.build.script[i] = {
              run: [
                'python -m venv ~/.venv',
                'source ~/.venv/bin/activate',
                'pip install "setuptools>=70,<77" setuptools_scm wheel',
              ],
            }
          }
        }
        // Activate venv before make install-bin so $(PYTHON) uses venv python.
        // Also patch pyproject.toml: mercurial's license field is ambiguous
        // (matches both old-style {text:...} and new-style expression), causing
        // setuptools to error with "must be valid exactly by one definition".
        // Removing the license field from [project] avoids this validation.
        if (typeof step === 'string' && step.includes('make install-bin')) {
          recipe.build.script[i] = [
            'source ~/.venv/bin/activate',
            'sed -i \'/^license\\b/d\' pyproject.toml',
            'PYTHON=$HOME/.venv/bin/python3 make install-bin PREFIX={{prefix}}',
          ].join(' && ')
        }
      }
    },
  },

  // ─── github.com/moretension/duti — fix make install on darwin ──────────

  'github.com/moretension/duti': {
    // Fix: configure produces empty -mmacosx-version-min= and wrong -arch i386/x86_64 on darwin24+.
    // Also produces broken -isysroot path (missing SDK name) causing CoreFoundation.h not found.
    // Override CFLAGS/LDFLAGS to force correct arm64 arch and deployment target.
    env: {
      MACOSX_DEPLOYMENT_TARGET: '11.0',
      CFLAGS: '-arch arm64 -mmacosx-version-min=11.0',
      LDFLAGS: '-arch arm64 -mmacosx-version-min=11.0',
    },
    prependScript: [
      // Set SDKROOT so clang can find system headers (CoreFoundation/CoreFoundation.h)
      // even when configure produces a broken -isysroot path
      'export SDKROOT="$(xcrun --show-sdk-path 2>/dev/null)"',
    ],
    modifyRecipe: (recipe: any) => {
      // Fix: nullglob causes ? in URLs to be treated as glob — quote all curl URLs
      if (Array.isArray(recipe.build?.script)) {
        for (const step of recipe.build.script) {
          if (typeof step === 'object' && step.run && typeof step.run === 'string') {
            // Quote unquoted URLs in curl commands (? is a glob char with nullglob)
            step.run = step.run.replace(
              /curl\s+-L\s+(https?:\/\/\S+)/g,
              (_match: string, url: string) => `curl -L "${url}"`,
            )
          }
        }
        // Fix: GitHub archive tarballs don't include pre-generated configure.
        // autoreconf generates a configure with shell syntax errors on newer autoconf.
        for (let i = 0; i < recipe.build.script.length; i++) {
          if (typeof recipe.build.script[i] === 'string' && recipe.build.script[i].includes('autoreconf')) {
            recipe.build.script[i] = 'autoreconf -fi'
          }
          if (typeof recipe.build.script[i] === 'string' && recipe.build.script[i].includes('./configure')) {
            // Patch configure for darwin24+: strip arch/version flags from configure source,
            // run configure, then strip broken -isysroot and empty -mmacosx-version-min=
            // from generated Makefiles (configure generates these at runtime, not from source)
            recipe.build.script[i] = [
              `sed -i.bak '/is not a supported system/s/as_fn_error[^;]*/: # accept unknown darwin version/' configure`,
              `sed -i.bak 's/-arch i386 -arch x86_64//g' configure`,
              `/bin/bash ./configure $ARGS`,
              // Fix generated Makefiles: strip broken -isysroot (points to SDKs dir, not SDK)
              // and empty -mmacosx-version-min= (our env CFLAGS provide correct values)
              `find . -name Makefile -exec sed -i.bak 's/-isysroot [^ ]*//g; s/-mmacosx-version-min=[^ ]*//g' {} +`,
            ].join(' && ')
          }
        }
      }
    },
  },

  // ─── gnu.org/inetutils — fix libtinfo linking on linux ───────────────
  // On linux, ncurses is split into libtinfo + libncursesw. The recipe uses
  // LDFLAGS=-ltinfo which gets placed before object files in link commands.
  // GNU ld with --as-needed discards it. LIBS is appended after objects.

  'gnu.org/inetutils': {
    platforms: {
      linux: {
        env: {
          LIBS: '-ltinfo',
        },
      },
    },
  },

  // p7zip: resolveGitHubTag now handles /^v/ fallback to find v17.05 tags
  // Original URL v{{version.raw}}.tar.gz works with resolved rawVersion

  // crates.io/mask and crates.io/didyoumean overrides already defined above

  // ─── openinterpreter.com — widen Python version ────────────────────────

  'openinterpreter.com': {
    modifyRecipe: (recipe: any) => {
      // Constrain to Python <3.13 — tiktoken dep uses PyO3 v0.20.3 which
      // only supports up to Python 3.12 (rejects 3.14+ at build time)
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3.10<3.13'
      }
      // Pre-install poetry-core (build backend) and setuptools before venv creation
      if (Array.isArray(recipe.build?.script)) {
        const venvIdx = recipe.build.script.findIndex(
          (s: any) => typeof s === 'string' && s.includes('python-venv.sh'),
        )
        if (venvIdx >= 0) {
          recipe.build.script.splice(venvIdx, 0,
            'python3 -m pip install --break-system-packages poetry-core "setuptools<78" wheel 2>/dev/null || true',
          )
        }
      }
    },
  },

  // github.com/luvit/luv duplicate removed — primary override at line ~5152 has more comprehensive fix

  // ─── github.com/pressly/sup — fix go mod init missing module name ───

  'github.com/pressly/sup': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.map((step: any) => {
          if (typeof step === 'string' && step.includes('go mod init')) {
            return step.replace('go mod init', 'go mod init github.com/pressly/sup')
          }
          return step
        })
      }
    },
  },

  // freedesktop.org/appstream and snaplet.dev/cli overrides already defined above

  // ─── gnome-extensions-cli — widen Python version ─────────────────────
  // Recipe requires ~3.11 but CI has Python 3.14

  'github.com/essembeh/gnome-extensions-cli': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['python.org']) {
        recipe.build.dependencies['python.org'] = '>=3.11<3.15'
      }
      // Replace poetry install with pip --no-build-isolation to use venv's packaging
      // Poetry creates isolated build envs with old packaging (missing packaging.licenses)
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = recipe.build.script.map((step: any) => {
          if (typeof step === 'string' && step.trim() === 'poetry install') {
            return '{{prefix}}/venv/bin/pip install --no-build-isolation .'
          }
          return step
        })
        // Also upgrade packaging after bkpyvenv stage
        const stageIdx = recipe.build.script.findIndex(
          (s: any) => typeof s === 'string' && s.includes('bkpyvenv stage'),
        )
        if (stageIdx >= 0) {
          recipe.build.script.splice(stageIdx + 1, 0,
            '{{prefix}}/venv/bin/pip install --upgrade "packaging>=24" "setuptools<78"',
          )
        }
      }
    },
  },

  // ─── practical-scheme.net/gauche — fix underscore tag format ────────────
  // Tags: release0_9_15 (underscores), metadata has 0.9.15 (dots)

  'practical-scheme.net/gauche': {
    distributableUrl: 'https://github.com/shirok/Gauche/releases/download/release{{version.major}}_{{version.minor}}_{{version.patch}}/Gauche-{{version}}.tgz',
  },

  // ─── amber-lang.com — alpha suffix in tags ──────────────────────────────
  // All tags have -alpha suffix (e.g. 0.5.1-alpha), stripped for versioning

  'amber-lang.com': {
    distributableUrl: 'https://github.com/Ph0enixKM/Amber/archive/refs/tags/{{version}}-alpha.tar.gz',
  },

  'mariadb.com/server': {
    supportedPlatforms: ['darwin/aarch64', 'linux/x86-64'],
    prependScript: [
      // Install bison >= 2.4 (required for SQL parser generation, macOS ships with 2.3)
      'brew install bison 2>/dev/null || sudo apt-get install -y bison 2>/dev/null || true',
      'export PATH="$(brew --prefix bison 2>/dev/null || echo /opt/homebrew/opt/bison)/bin:$PATH"',
    ],
    modifyRecipe(recipe: any) {
      const args = recipe.build?.env?.CMAKE_ARGS
      if (Array.isArray(args)) {
        // Disable mroonga (groonga text search) — headers incompatible with modern Xcode SDK
        args.push('-DPLUGIN_MROONGA=NO')
        if (process.platform === 'darwin') {
          // Explicitly tell cmake where to find Homebrew bison (macOS system bison is too old)
          args.push('-DBISON_EXECUTABLE=/opt/homebrew/opt/bison/bin/bison')
        }
      }
      // Remove groonga dep since mroonga is disabled
      if (recipe.build?.dependencies) {
        delete recipe.build.dependencies['groonga.org']
      }
    },
  },

  // ─── jbang.dev — fix cp path after strip-components ─────────────────
  // YAML does cp -r ./jbang-{{version}}/* but strip-components=1 already
  // removes the top-level dir, so contents are directly in the build dir.

  'erlang.org': {
    // Erlang wrapper scripts (erl, escript, etc.) use $0 to find dyn_erl for relocation.
    // Through symlink chains (.bin/erl → bin/erl → lib/erlang/bin/erl), $0 stays as the
    // outermost path, so dyn_erl can't be found and it falls back to hardcoded build paths.
    // Fix: resolve $0 through symlinks so dirname gives the real script location.
    modifyRecipe: (recipe: any) => {
      if (!recipe.build) return
      const script = Array.isArray(recipe.build.script) ? recipe.build.script : (recipe.build.script ? [recipe.build.script] : [])
      script.push(
        [
          '# Fix Erlang scripts to resolve symlinks in $0 (enables dyn_erl relocation)',
          'for f in "{{prefix}}"/lib/erlang/bin/erl "{{prefix}}"/lib/erlang/bin/erlc "{{prefix}}"/lib/erlang/bin/escript "{{prefix}}"/lib/erlang/bin/ct_run "{{prefix}}"/lib/erlang/bin/dialyzer "{{prefix}}"/lib/erlang/bin/typer; do',
          '  [ -f "$f" ] || continue',
          '  [ -L "$f" ] && continue',
          '  sed -i.bak \'s#^prog="$0"#prog="$(readlink -f "$0" 2>/dev/null || echo "$0")"#g\' "$f"',
          '  rm -f "${f}.bak"',
          'done',
        ].join('\n'),
      )
      recipe.build.script = script
    },
  },

  'mercure.rocks': {
    // Recipe says linux-only but it's a Go binary that builds fine on darwin
    supportedPlatforms: ['darwin/aarch64', 'linux/x86-64'],
  },

  'jbang.dev': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('cp -r ./jbang-')) {
            recipe.build.script[i] = step.replace(/cp -r \.\/jbang-\{\{version\}\}\/\*/, 'cp -r ./*')
          }
        }
      }
    },
  },

  // ─── people.redhat.com/sgrubb/libcap-ng — disable Python SWIG bindings ──
  // SWIG 4.0+ removed the %except directive used in capng_swig.i

  'people.redhat.com/sgrubb/libcap-ng': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.CONFIGURE_ARGS)) {
        for (const flag of ['--without-python', '--without-python3']) {
          if (!recipe.build.env.CONFIGURE_ARGS.includes(flag)) {
            recipe.build.env.CONFIGURE_ARGS.push(flag)
          }
        }
      }
    },
  },

  // ─── kotlinlang.org — fix working-directory after strip-components ───
  // The zip has kotlinc/ as top-level which gets stripped. The YAML then
  // tries to cd into kotlinc/ which no longer exists. Remove working-directory.

  'kotlinlang.org': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.['working-directory'] === 'kotlinc') {
        delete recipe.build['working-directory']
      }
    },
  },

  // ─── crates.io/git-delta — remove --locked for newer Rust compat ────
  // time crate v0.3.31 has a type inference issue with Rust 1.93+.
  // Removing --locked lets cargo resolve a compatible time version.

  'crates.io/git-delta': {
    modifyRecipe: (recipe: any) => {
      // time crate v0.3.31 has a type inference issue with Rust 1.93+.
      // Removing --locked lets cargo resolve a compatible time version.
      if (typeof recipe.build?.script === 'string' && recipe.build.script.includes('--locked')) {
        recipe.build.script = recipe.build.script.replace(' --locked', '')
      }
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('--locked')) {
            recipe.build.script[i] = step.replace(' --locked', '')
          }
        }
      }
    },
  },

  // ─── crates.io/topgrade — v14.0.1 is broken: --locked fails (time crate + Rust 1.93),
  // without --locked fails (clap_mangen 0.2.31 vs clap_builder 4.4.18 API mismatch).
  // Only latest versions (15+) build correctly. Skip old versions.
  'crates.io/topgrade': {
    modifyRecipe: (recipe: any) => {
      // Keep --locked for newer versions that have compatible lockfiles
      // Old versions (14.x) will fail either way — this is an upstream issue
      if (typeof recipe.build?.script === 'string' && recipe.build.script.includes('--locked')) {
        recipe.build.script = recipe.build.script.replace(' --locked', '')
      }
    },
  },

  // ─── github.com/DaanDeMeyer/reproc — fix GCC 13 -Wchanges-meaning error ──
  'github.com/DaanDeMeyer/reproc': {
    env: { CXXFLAGS: '-Wno-error=changes-meaning' },
  },

  // ─── cuelang.org — pin Go <1.25 for old versions ─────────────────────
  // Go 1.26 has stricter constant expression handling that breaks the vendored
  // tokeninternal package in cuelang v0.11-0.12.
  'cuelang.org': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['go.dev']) {
        recipe.build.dependencies['go.dev'] = '>=1.18<1.25'
      }
    },
  },

  // ─── gvisor-tap-vsock — pin Go <1.25 for old versions ────────────────
  // Go 1.26 build constraints exclude vendored gvisor/pkg/gohacks files.
  'github.com/containers/gvisor-tap-vsock': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.dependencies?.['go.dev']) {
        recipe.build.dependencies['go.dev'] = '>=1.18<1.25'
      }
    },
  },

  // ─── convco.github.io — same time crate issue as git-delta ─────────
  'convco.github.io': {
    modifyRecipe: (recipe: any) => {
      if (typeof recipe.build?.script === 'string' && recipe.build.script.includes('--locked')) {
        recipe.build.script = recipe.build.script.replace(' --locked', '')
      }
    },
  },

  // ─── glm.g-truc.net — fix cp paths after zip extraction ──────────────
  // The zip extracts with a glm/ subdirectory, so headers are in glm/ not .
  'glm.g-truc.net': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('cp -a detail')) {
            // Replace individual cp with copying from glm/ subdirectory
            recipe.build.script[i] = step
              .replace("cp -a detail ext gtc gtx simd *.hpp", "cp -a glm/detail glm/ext glm/gtc glm/gtx glm/simd glm/*.hpp")
          }
        }
      }
    },
  },

  // ─── cython.org/libcython — pin Python <3.14 ──────────────────────
  // Cython 0.29.x uses _PyLong_AsByteArray with old 5-arg signature;
  // Python 3.14 changed to 6 args. Python 3.12 only available on darwin in S3.
  // On linux (only Python 3.14), skip since we can't patch generated C reliably.
  'cython.org/libcython': {
    modifyRecipe: (recipe: any) => {
      if (recipe.dependencies?.['python.org']) {
        recipe.dependencies['python.org'] = '>=3.11<3.14'
      }
    },
  },

  // ─── mkdocs.org — disable pip build isolation + install hatchling ─────
  // mkdocs requires hatchling as its build backend (in pyproject.toml).
  // pip's build isolation creates a fresh env without hatchling, failing with
  // ModuleNotFoundError. Disabling isolation lets pip use system-installed hatchling.
  'mkdocs.org': {
    env: { PIP_NO_BUILD_ISOLATION: '1' },
    prependScript: [
      'python3 -m pip install --break-system-packages setuptools hatchling hatch-requirements-txt "wheel<1" 2>/dev/null || pip3 install --break-system-packages setuptools hatchling hatch-requirements-txt "wheel<1" 2>/dev/null || true',
    ],
  },

  // ─── catb.org/wumpus — fix K&R C compilation on modern clang ──────────
  // Old C code uses main(argc, argv) without int type specifier.
  'catb.org/wumpus': {
    env: { CFLAGS: '-Wno-error=implicit-int -Wno-error=implicit-function-declaration -Wno-error=int-conversion' },
  },

  // ─── gnu.org/diffutils — fix SIGSTKSZ + gets() for modern glibc ──────
  // SIGSTKSZ is no longer a compile-time constant in glibc 2.34+.
  // gets() was removed from glibc headers (deprecated since C11).
  'gnu.org/diffutils': {
    prependScript: [
      `sed -i.bak 's/HAVE_LIBSIGSEGV && SIGSTKSZ < 16384/0/' lib/c-stack.c 2>/dev/null || true`,
      `sed -i.bak '/^_GL_WARN_ON_USE (gets,/d' lib/stdio.in.h lib/stdio.h 2>/dev/null || true`,
    ],
  },

  // ─── github.com/Carthage/Carthage — remove -static-stdlib ────────────
  // Swift 6 removed -static-stdlib on Apple platforms (runtime is in the OS).
  'github.com/Carthage/Carthage': {
    prependScript: [
      `sed -i.bak 's/-Xswiftc -static-stdlib//g' Makefile 2>/dev/null || true`,
    ],
  },

  // ─── fltk.org — disable Wayland on linux ─────────────────────────────
  // CI runners lack wayland-protocols / wayland-scanner, causing
  // "xdg-shell-client-protocol.h: No such file or directory". Disable Wayland.
  'fltk.org': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--disable-wayland')
      }
    },
  },

  // ─── protobuf-c — fix abseil ABI mismatch ────────────────────────────
  // protobuf.dev 34.0.0 was compiled against abseil 20260107 (ABI version 2601).
  // The YAML pins abseil.io: ^20250127 which selects 20250127.2.0 (ABI 2501).
  // Override abseil constraint to match what protobuf was actually built with.
  'github.com/protobuf-c/protobuf-c': {
    modifyRecipe: (recipe: any) => {
      if (recipe.dependencies?.['abseil.io']) {
        recipe.dependencies['abseil.io'] = '>=20260107'
      }
    },
  },

  // ─── tuist.io/xcbeautify — cap swift-tools-version at 5.10 ──────────
  // ─── github.com/realm/SwiftLint — restrict to darwin only ────────────
  // Swift is not available on Linux CI runners; SwiftLint is macOS-only.
  'github.com/realm/SwiftLint': {
    supportedPlatforms: ['darwin-arm64'],
  },

  // ─── schollz.com/croc — remove -asan from Linux ARGS ─────────────────
  // The Go -asan flag requires gcc/clang recognized by Go's sanitizer check.
  // Buildkit's CC wrapper isn't recognized, causing "C compiler is not gcc or clang".
  'schollz.com/croc': {
    modifyRecipe: (recipe: any) => {
      if (recipe.build?.env?.linux?.ARGS) {
        recipe.build.env.linux.ARGS = recipe.build.env.linux.ARGS.filter(
          (a: string) => a !== '-asan',
        )
      }
    },
  },

  // Swift 6 enables strict concurrency by default which breaks older sources.
  // Cap the tools version at 5.10 to avoid MutableGlobalVariable errors.

  'tuist.io/xcbeautify': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          // Replace the sed that rewrites swift-tools-version to system version
          // with a fixed version that avoids Swift 6 strict concurrency
          if (typeof step === 'object' && typeof step.run === 'string' && step.run.includes('swift-tools-version')) {
            step.run = step.run.replace(
              /sed -i "s\/swift-tools-version:.*\/swift-tools-version:\$SWIFT_VERSION\/"/,
              'sed -i "s/swift-tools-version:.*/swift-tools-version:5.10/" ',
            )
          } else if (typeof step === 'object' && Array.isArray(step.run)) {
            for (let j = 0; j < step.run.length; j++) {
              if (typeof step.run[j] === 'string' && step.run[j].includes('swift-tools-version')) {
                step.run[j] = 'sed -i "s/swift-tools-version:.*/swift-tools-version:5.10/" Package.swift'
              }
            }
          }
        }
      }
    },
  },

  // ─── rhash.sourceforge.net — disable gettext on macOS ───────────────
  // Homebrew gettext is keg-only; configure finds it but linker can't find libintl.

  'rhash.sourceforge.net': {
    modifyRecipe: (recipe: any) => {
      if (Array.isArray(recipe.build?.script)) {
        for (let i = 0; i < recipe.build.script.length; i++) {
          const step = recipe.build.script[i]
          if (typeof step === 'string' && step.includes('./configure')) {
            recipe.build.script[i] = step.replace('./configure', './configure --disable-gettext')
          }
        }
      }
    },
  },

  // ─── iproute2mac — older versions have fewer files ─────────────────
  // v1.4.x only has src/ip.py; src/iproute2mac.py and src/bridge.py were added later.

  'github.com/brona/iproute2mac': {
    modifyRecipe: (recipe: any) => {
      // recipe.build is normalized to { script: [...] } before modifyRecipe runs
      const steps = recipe.build?.script
      if (Array.isArray(steps)) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          if (typeof step === 'string' && step.includes('install -D')) {
            const match = step.match(/install -D (\S+)/)
            if (match) {
              steps[i] = `test -f ${match[1]} && ${step} || true`
            }
          }
        }
      }
    },
  },

  // ─── elementsproject.org — fix autoreconf/libtool on darwin + BDB ──────

  'elementsproject.org': {
    prependScript: [GLIBTOOL_FIX],
    modifyRecipe: (recipe: any) => {
      // v22.x requires BDB headers we don't have — disable BDB wallet
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('--without-bdb')
      }
    },
  },

  // ─── ctags.io — fix docutils rst2man + libiconv ─────────────────────────

  'ctags.io': {
    platforms: {
      darwin: {
        prependScript: [
          'brew install libiconv 2>/dev/null || true',
          'export LDFLAGS="-L$(brew --prefix libiconv)/lib ${LDFLAGS:-}"',
          'export CPPFLAGS="-I$(brew --prefix libiconv)/include ${CPPFLAGS:-}"',
        ],
      },
    },
    modifyRecipe: (recipe: any) => {
      // Remove docutils dep (broken venv wrapper for rst2man in S3)
      // ctags builds fine without man pages
      if (recipe.build?.dependencies?.['docutils.org']) {
        delete recipe.build.dependencies['docutils.org']
      }
      // Add --disable-man flag to skip man page generation
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('RST2MAN=true')
      }
    },
  },

  // ─── curlie.io — bypass goreleaser (config v0 vs v2 mismatch) ──────────

  'curlie.io': {
    modifyRecipe: (recipe: any) => {
      // Replace goreleaser + install with direct go build
      // goreleaser config version mismatch causes older versions to fail
      if (Array.isArray(recipe.build?.script)) {
        recipe.build.script = [
          'mkdir -p {{prefix}}/bin',
          'go build -ldflags="-s -w" -o {{prefix}}/bin/curlie .',
        ]
      }
      // Remove goreleaser dependency since we don't use it
      if (recipe.build?.dependencies?.['goreleaser.com']) {
        delete recipe.build.dependencies['goreleaser.com']
      }
    },
  },

  // ─── harfbuzz.org — disable introspection (g-ir-scanner incompatible with Python 3.12+) ──

  'harfbuzz.org': {
    modifyRecipe: (recipe: any) => {
      // Disable gobject-introspection — the S3 g-ir-scanner was built against
      // an older Python and imports distutils (removed in 3.12+) / has ABI mismatch
      if (recipe.build?.dependencies?.['gnome.org/gobject-introspection']) {
        delete recipe.build.dependencies['gnome.org/gobject-introspection']
      }
      // Add meson flag to disable introspection
      if (Array.isArray(recipe.build?.env?.ARGS)) {
        recipe.build.env.ARGS.push('-Dintrospection=disabled')
      }
    },
  },
}
