import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/aws-cloudformation/cfn-lint',
  name: 'cfn-lint',
  programs: [
    'cfn-lint',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'pyyaml.org': '*',
    'github.com/benjaminp/six': '*',
  },
  buildDependencies: {
    'rust-lang.org': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/aws-cloudformation/cfn-lint/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/__version__ = ".*"/__version__ = {{version}}/\' version.py',
        'working-directory': 'src/cfnlint',
      },
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} cfn-lint',
    ],
  },
  test: {
    script: [
      'cfn-lint test.yml',
      'cfn-lint -v | grep {{version}}',
    ],
  },
}
