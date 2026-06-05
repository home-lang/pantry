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
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  // x.org's www.x.org/archive/ tarball tree was retired (404s); the
  // freedesktop GitLab mirror ships the same sources but ships only the
  // autotools build (configure.ac/Makefile.am, no meson.build and no
  // pre-bootstrapped ./configure), so bootstrap with autogen.sh then build.
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxfixes/-/archive/libXfixes-{{version}}/libxfixes-libXfixes-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure --prefix="{{prefix}}" --libdir="{{prefix}}/lib" --disable-static',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'pkg-config --modversion xfixes | grep {{version}}',
    ],
  },
}
