import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/which',
  name: 'which',
  programs: [
    'which',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/which/which-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/extern int getopt();/extern int getopt(int, char * const [], const char *);/\' getopt.h',
        if: 'darwin',
      },
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
      ],
    },
  },
}
