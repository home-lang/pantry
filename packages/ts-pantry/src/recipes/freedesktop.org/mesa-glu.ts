import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/mesa-glu',
  name: 'mesa-glu',
  programs: [],
  dependencies: {
    'mesa3d.org': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'freedesktop.org/pkg-config': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/mesa/glu/-/archive/glu-{{version}}/glu-glu-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup $MESON_ARGS build',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      MESON_ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dgl_provider=gl',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion glu | grep {{version}}',
      'c++ test.cpp -lGLU -o test',
      './test',
    ],
  },
}
