import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/pciaccess',
  name: 'pciaccess',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://www.x.org/pub/individual/lib/libpciaccess-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
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
