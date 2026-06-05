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
    'freedesktop.org/pkg-config': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  // www.x.org/archive tarballs were retired (404); fetch from the freedesktop
  // GitLab mirror. libxcvt is meson-only (no autotools), so no autogen needed.
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxcvt/-/archive/libxcvt-{{version}}/libxcvt-libxcvt-{{version}}.tar.gz',
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
