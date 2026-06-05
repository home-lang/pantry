import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/slirp',
  name: 'slirp',
  programs: [],
  dependencies: {
    'gnome.org/glib': '^2',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '1',
    'freedesktop.org/pkg-config': '^0.29',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/slirp/libslirp/-/archive/v{{ version }}/libslirp-v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson build $ARGS',
      'ninja -C build install all',
    ],
    env: {
      ARGS: [
        '-Ddefault_library=both',
        '--prefix={{ prefix }}',
        '--libdir={{ prefix }}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
      linux: {
        LDFLAGS: [
          '-Wl,--undefined-version',
        ],
      },
    },
  },
  test: {
    script: [
      'gcc $FIXTURE -lslirp -o test',
      './test',
    ],
  },
}
