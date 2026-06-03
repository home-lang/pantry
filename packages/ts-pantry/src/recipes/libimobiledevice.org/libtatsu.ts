import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libimobiledevice.org/libtatsu',
  name: 'libtatsu',
  programs: [],
  dependencies: {
    'libimobiledevice.org/libplist': '^2.6',
    'rockdaboot.github.io/libpsl': '*',
    'curl.se': '>=7',
  },
  buildDependencies: {
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/libimobiledevice/libtatsu/releases/download/{{version.tag}}/libtatsu-{{version.tag}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'cc -ltatsu $FIXTURE -o test',
      './test',
    ],
  },
}
