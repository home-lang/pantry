import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/zx',
  name: 'zx',
  programs: [
    'zx',
  ],
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'npmjs.com': '*',
    'curl.se': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'curl -L https://registry.npmjs.org/zx/-/zx-{{version}}.tgz --output zx-{{version}}.tgz',
      'npm i $ARGS',
      {
        run: 'ln -s ../libexec/bin/zx zx',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '-ddd',
        '--global',
        '--build-from-source',
        '--prefix={{prefix}}/libexec',
        '--unsafe-perm',
        'zx-{{version}}.tgz',
      ],
    },
  },
  test: {
    script: [
      'zx --version | grep {{version}}',
      'zx test.mjs | grep "name is bar"',
      'ls | grep bar',
    ],
  },
}
