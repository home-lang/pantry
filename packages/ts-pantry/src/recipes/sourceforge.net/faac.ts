import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/faac',
  name: 'faac',
  programs: [
    'faac',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/knik0/faac/archive/refs/tags/{{version.major}}_{{version.minor}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './bootstrap',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'faac test.mp3 -P -o test.m4a',
      'ls | grep test.m4a',
    ],
  },
}
