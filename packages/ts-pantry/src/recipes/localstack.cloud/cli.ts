import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'localstack.cloud/cli',
  name: 'cli',
  programs: [
    'localstack',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.11',
  },
  distributable: {
    url: 'https://github.com/localstack/localstack-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install -r requirements.txt $PIP_ARGS',
      'bkpyvenv seal {{prefix}} localstack',
    ],
    env: {
      darwin: {
        PIP_ARGS: '--use-deprecated=legacy-resolver',
      },
    },
  },
  test: {
    script: [
      'localstack --version',
      'test "$(localstack --version)" = {{version}} || test "$(localstack --version)" = \'LocalStack CLI {{version}}\'',
    ],
  },
}
