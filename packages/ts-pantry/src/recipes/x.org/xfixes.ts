import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xfixes',
  name: 'xfixes',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  // x.org's www.x.org/archive/ tarball tree was retired (404s); the
  // freedesktop GitLab mirror ships the same sources but without a
  // pre-bootstrapped ./configure, so build via meson (which only needs the
  // pkg-config deps already declared above).
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxfixes/-/archive/libXfixes-{{version}}/libxfixes-libXfixes-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion xfixes | grep {{version}}',
    ],
  },
}
