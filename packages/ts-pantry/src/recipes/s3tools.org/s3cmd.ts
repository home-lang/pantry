import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 's3tools.org/s3cmd',
  name: 's3cmd',
  programs: [
    's3cmd',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3',
  },
  distributable: {
    url: 'https://github.com/s3tools/s3cmd/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} s3cmd',
    ],
  },
}
