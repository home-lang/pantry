import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/zaach/jsonlint',
  name: 'jsonlint',
  programs: [
    'jsonlint',
  ],
  dependencies: {
    'nodejs.org': '^20',
  },
  buildDependencies: {
    'npmjs.com': '^10',
  },
  distributable: {
    url: 'https://github.com/zaach/jsonlint/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm i $ARGS .',
    ],
    env: {
      ARGS: [
        '-ddd',
        '--global',
        '--build-from-source',
        '--prefix={{prefix}}',
        '--install-links',
        '--unsafe-perm',
      ],
    },
  },
  test: {
    script: [
      'jsonlint $FIXTURE | grep test',
      'jsonlint --help',
    ],
  },
}
