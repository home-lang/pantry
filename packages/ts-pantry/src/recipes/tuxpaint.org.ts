import type { Recipe } from '../../scripts/recipe-types'

// Tux Paint 0.9.35 hard-requires SDL2_Pango: src/fonts.c and src/tuxpaint.c
// unconditionally `#include "SDL2_Pango.h"` and `#error` if it (or the matching
// SDL2_Pango.pc) is missing — there is NO build flag to disable it. Ubuntu has no
// `libsdl2-pango-dev` apt package and pantry has no SDL2_Pango recipe, so the only
// way to build on linux is to compile SDL2_Pango ourselves first.
//
// We build the maintained fork (github.com/markuskimius/SDL2_Pango, matching pkgx's
// dependency) as a STATIC library and let tuxpaint's Makefile pick it up via
// PKG_CONFIG_PATH. Static linking means libSDL2_Pango is absorbed into the tuxpaint
// binary, so nothing extra needs to ship or be relocated at runtime (pango/pangoft2
// remain regular runtime deps). The release tarball ships a pre-generated `configure`,
// so no autoreconf is needed. SDL2_Pango needs sdl2-config (libsdl2-dev) and
// pango/pangoft2 (libpango1.0-dev), both provided by the CI apt list.
const SDL2_PANGO_VERSION = '2.1.5'

export const recipe: Recipe = {
  propsDir: 'props/tuxpaint.org',
  domain: 'tuxpaint.org',
  name: 'tuxpaint',
  programs: ['tp-magic-config', 'tuxpaint', 'tuxpaint-import'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/tuxpaint/tuxpaint/{{version}}/tuxpaint-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'cairographics.org': '*',
    'ferzkopp.net/SDL2_gfx': '*',
    'github.com/markuskimius/SDL2_Pango': '*',
    'gnome.org/librsvg': '*',
    'gnome.org/libxml2': '*',
    'gnome.org/pango': '*',
    'gnu.org/fribidi': '*',
    'libpng.org': '*',
    'libsdl.org': '2',
    'libsdl.org/SDL_image': '2',
    'libsdl.org/SDL_mixer': '2',
    'libsdl.org/SDL_ttf': '2',
    'pngquant.org/lib': '*',
    'zlib.net': '*',
    // pkgx declares libpaper as a linux-only runtime dep (tuxpaint links it for
    // print-paper-size support); it was dropped in the auto-conversion.
    linux: {
      'github.com/rrthomas/libpaper': '*',
    },
  },
  buildDependencies: {
    'freedesktop.org/appstream': '*',
    'gnu.org/bash': '*',
    'gnu.org/gperf': '*',
    'imagemagick.org': '*',
  },

  build: {
    script: [
      { run: 'patch -p1 < props/relocatable.patch', if: 'linux' },
      // Build SDL2_Pango from source (no apt package, no pantry recipe) and install
      // it (static) into a local prefix so tuxpaint's Makefile finds it via pkg-config.
      {
        if: 'linux',
        run: [
          'set -e',
          'SDL2_PANGO_PREFIX="$SRCROOT/.sdl2_pango/prefix"',
          'mkdir -p "$SRCROOT/.sdl2_pango/build"',
          `curl -fsSL "https://github.com/markuskimius/SDL2_Pango/archive/refs/tags/v${SDL2_PANGO_VERSION}.tar.gz" -o "$SRCROOT/.sdl2_pango/src.tar.gz"`,
          'tar -xzf "$SRCROOT/.sdl2_pango/src.tar.gz" -C "$SRCROOT/.sdl2_pango/build" --strip-components=1',
          '(',
          '  cd "$SRCROOT/.sdl2_pango/build"',
          '  ./configure --prefix="$SDL2_PANGO_PREFIX" --enable-static --disable-shared --with-pic',
          '  make --jobs {{hw.concurrency}}',
          '  make install',
          ')',
          // Expose SDL2_Pango.pc (Makefile uses `pkg-config --exists/--cflags/--libs SDL2_Pango`).
          'export PKG_CONFIG_PATH="$SDL2_PANGO_PREFIX/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
          'export LIBRARY_PATH="$SDL2_PANGO_PREFIX/lib:${LIBRARY_PATH:-}"',
        ],
      },
      { run: 'make --jobs {{hw.concurrency}} $ARGS ARCH_CFLAGS="-I{{deps.ferzkopp.net/SDL2_gfx.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_image.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_mixer.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_ttf.prefix}}/include/SDL2"' },
      'make $ARGS install',
    ],
    env: {
      ARGS: ['PREFIX={{prefix}}', 'COMPLETIONDIR={{prefix}}/etc', 'GPERF={{deps.gnu.org/gperf.prefix}}/bin/gperf', 'PACKAGE_ONLY=yes', 'SHELL={{deps.gnu.org/bash.prefix}}/bin/bash'],
    },
  },
}
