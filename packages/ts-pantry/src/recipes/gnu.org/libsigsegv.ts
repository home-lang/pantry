import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libsigsegv',
  name: 'libsigsegv',
  programs: [],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libsigsegv/libsigsegv-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} check',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--enable-shared',
        '--enable-relocatable',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lsigsegv -o test',
      './test | grep \'Test passed\'',
    ],
  },
}
