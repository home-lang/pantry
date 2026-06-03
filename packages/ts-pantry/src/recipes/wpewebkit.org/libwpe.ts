import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wpewebkit.org/libwpe',
  name: 'libwpe',
  programs: [],
  dependencies: {
    'xkbcommon.org': '*',
    'mesa3d.org': '*',
  },
  buildDependencies: {
    'gnu.org/gcc': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/WebPlatformForEmbedded/libwpe/releases/download/{{version}}/libwpe-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      LDFLAGS: '-fPIC',
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'make wpe-test',
      './wpe-test | grep {{version}}',
    ],
  },
}
