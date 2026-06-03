import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/FredHucht/pstree',
  name: 'pstree',
  programs: [
    'pstree',
  ],
  buildDependencies: {
    'gnu.org/gcc': '*',
  },
  distributable: {
    url: 'https://github.com/FredHucht/pstree/archive/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} pstree CC=gcc',
      'mkdir -p {{prefix}}/bin',
      'mkdir -p {{prefix}}/man1',
      'mv pstree {{prefix}}/bin',
      'mv pstree.1 {{prefix}}/man1',
    ],
    env: {
      'linux/x86-64': {
        CFLAGS: [
          '-fPIC',
        ],
      },
    },
  },
}
