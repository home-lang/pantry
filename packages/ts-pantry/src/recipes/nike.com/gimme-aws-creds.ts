import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nike.com/gimme-aws-creds',
  name: 'gimme-aws-creds',
  programs: [
    'gimme-aws-creds',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.11',
  },
  distributable: {
    url: 'https://github.com/Nike-Inc/gimme-aws-creds/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} gimme-aws-creds',
    ],
  },
  test: {
    script: [
      'touch ~/.okta_aws_login_config',
      'test "$(gimme-aws-creds --version)" = "gimme-aws-creds {{version}}"',
    ],
  },
}
