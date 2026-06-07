import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/libtirpc',
  name: 'libtirpc',
  programs: [],
  platforms: ['linux'],
  dependencies: {
    'kerberos.org': '*',
  },
  buildDependencies: {
    linux: {
      'llvm.org': '^16',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/libtirpc/libtirpc/{{version}}/libtirpc-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      LD: 'ld.lld',
      ARGS: [
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -ltirpc -o test',
      './test',
    ],
  },
}
