import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rockdaboot.github.io/libpsl',
  name: 'libpsl',
  programs: [],
  dependencies: {
    'unicode.org': '^71',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/rockdaboot/libpsl/releases/download/{{version}}/libpsl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      linux: {
        LDFLAGS: '-fPIC',
      },
      MESON_ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Druntime=libicu',
        '-Dbuiltin=true',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lpsl -o test',
      './test',
    ],
  },
}
