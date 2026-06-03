import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aws.amazon.com/sam',
  name: 'sam',
  programs: [
    'sam',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
    'rust-lang.org': '*',
  },
  distributable: {
    url: 'https://github.com/aws/aws-sam-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} sam',
    ],
  },
  test: {
    script: [
      'sam --version | tee out',
      'grep {{version}} out',
      'sam validate --region us-east-1 2>&1 | tee out',
      'grep \'is a valid SAM Template\' out',
    ],
  },
}
