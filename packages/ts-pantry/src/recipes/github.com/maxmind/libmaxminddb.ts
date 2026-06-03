import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/maxmind/libmaxminddb',
  name: 'libmaxminddb',
  programs: [
    'mmdblookup',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
    'curl.se': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/maxmind/libmaxminddb/releases/download/{{version}}/libmaxminddb-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'curl -L https://patch-diff.githubusercontent.com/raw/maxmind/libmaxminddb/pull/419.diff | patch -p1',
        if: '>=1.13<1.13.2',
      },
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
    },
  },
}
