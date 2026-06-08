import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/pciaccess',
  platforms: ['linux'],
  name: 'pciaccess',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  // www.x.org/pub tarballs were retired (404); fetch from the freedesktop
  // GitLab mirror, which ships sources without a pre-built ./configure, so
  // bootstrap with autogen.sh before the autotools build.
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libpciaccess/-/archive/libpciaccess-{{version.marketing}}/libpciaccess-libpciaccess-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir={{prefix}}/etc',
        '--localstatedir={{prefix}}/var',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion pciaccess | grep {{version.marketing}}',
    ],
  },
}
