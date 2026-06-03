import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libcvt',
  name: 'libcvt',
  programs: [
    'cvt',
  ],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libxcvt-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson build/ --prefix={{ prefix }}',
      'ninja -C build/ install',
    ],
  },
  test: {
    script: [
      'bash -c \'(cvt 2>&1 || true)\' | grep \'Calculates VESA CVT\'',
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
