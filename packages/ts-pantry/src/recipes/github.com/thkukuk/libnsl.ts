import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thkukuk/libnsl',
  name: 'libnsl',
  programs: [],
  dependencies: {
    'sourceforge.net/libtirpc': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'gnu.org/gcc': '*',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/thkukuk/libnsl/releases/download/v{{version}}/libnsl-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'gcc test.c -lnsl -o test',
      './test | grep domain',
    ],
  },
}
