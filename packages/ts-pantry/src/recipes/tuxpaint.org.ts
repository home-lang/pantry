import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
  },
  buildDependencies: {
    'freedesktop.org/appstream': '*',
    'gnu.org/bash': '*',
    'gnu.org/gperf': '*',
    'imagemagick.org': '*',
  },

  build: {
    script: [
      'patch -p1 < props/relocatable.patch',
      'make --jobs {{ hw.concurrency }} $ARGS ARCH_CFLAGS="-I{{deps.ferzkopp.net/SDL2_gfx.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_image.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_mixer.prefix}}/include/SDL2 -I{{deps.libsdl.org/SDL_ttf.prefix}}/include/SDL2"',
      'make $ARGS install',
    ],
    env: {
      'ARGS': ['PREFIX={{prefix}}', 'COMPLETIONDIR={{prefix}}/etc', 'GPERF={{deps.gnu.org/gperf.prefix}}/bin/gperf', 'PACKAGE_ONLY=yes', 'SHELL={{deps.gnu.org/bash.prefix}}/bin/bash'],
    },
  },
}
