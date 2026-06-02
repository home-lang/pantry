import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/bison',
  name: 'bison',
  description: 'Parser generator',
  homepage: 'https://www.gnu.org/software/bison/',
  github: 'https://github.com/akimd/bison',
  programs: ['bison', 'yacc'],
  versionSource: {
    type: 'github-tags',
    repo: 'akimd/bison',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/bison/bison-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    // bison cannot operate without the m4 executable
    'gnu.org/m4': '1',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      M4: 'm4', // or fails on Linux
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-relocatable',
      ],
    },
  },
}
