import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/igorshubovych/markdownlint-cli',
  name: 'markdownlint-cli',
  programs: [
    'markdownlint',
  ],
  dependencies: {
    'nodejs.org': '>=18',
  },
  buildDependencies: {
    'npmjs.com': '^10',
  },
  distributable: {
    url: 'https://github.com/igorshubovych/markdownlint-cli/archive/refs/tags/v{{version}}.tar.gz',
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
      'test "$(markdownlint --version)" = {{version}}',
    ],
  },
}
