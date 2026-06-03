import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'localstack.cloud/awscli-local',
  name: 'awscli-local',
  programs: [
    'awslocal',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'aws.amazon.com/cli': '^2',
  },
  buildDependencies: {
    'python.org': '^3.11',
  },
  distributable: {
    url: 'https://github.com/localstack/awscli-local/archive/5b38bc5f3e954298c27a1895578390398f968814.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} awslocal',
    ],
  },
  test: {
    script: [
      'awslocal --version',
      'awslocal --version | grep aws-cli/2',
    ],
  },
}
