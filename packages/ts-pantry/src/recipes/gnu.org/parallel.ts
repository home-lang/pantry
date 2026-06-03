import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/parallel',
  name: 'parallel',
  programs: [
    'env_parallel',
    'niceload',
    'parallel',
    'parcat',
    'parset',
    'parsort',
    'sem',
    'sql',
  ],
  dependencies: {
    'perl.org': 5,
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/parallel/parallel-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      PATH: '${{prefix}}/bin:$PATH',
    },
  },
  test: {
    script: [
      'parallel --will-cite echo \':::\' test test | grep \'test\'',
      'parallel --version | grep {{version.raw}}',
    ],
  },
}
