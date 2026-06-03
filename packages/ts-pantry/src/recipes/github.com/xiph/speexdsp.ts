import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/xiph/speexdsp',
  name: 'speexdsp',
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/xiph/speexdsp/archive/SpeexDSP-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion speexdsp | grep {{version}}',
      'cc test.c -o test',
      './test',
    ],
  },
}
