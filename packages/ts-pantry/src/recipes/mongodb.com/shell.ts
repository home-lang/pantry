import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mongodb.com/shell',
  name: 'shell',
  programs: [
    'mongosh',
  ],
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'npmjs.com': '*',
    'curl.se': '*',
    'python.org': 3,
  },
  distributable: undefined,
  build: {
    script: [
      'curl -L https://registry.npmjs.org/@mongosh/cli-repl/-/cli-repl-{{version}}.tgz --output cli-repl-{{version}}.tgz',
      'npm i $ARGS',
      {
        run: 'ln -s ../libexec/bin/mongosh mongosh',
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
        'cli-repl-{{version}}.tgz',
      ],
    },
  },
  test: {
    script: [
      'mongosh --version | grep {{version}}',
      'mongosh --nodb --eval "print(\'#ok#\')" | grep \'#ok#\'',
      'mongosh --smokeTests',
    ],
  },
}
