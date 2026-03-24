import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kaggle.com',
  name: 'kaggle',
  description: 'Official Kaggle API',
  github: 'https://github.com/Kaggle/kaggle-api',
  programs: ['kaggle'],
  versionSource: {
    type: 'github-releases',
    repo: 'Kaggle/kaggle-api',
  },
  distributable: {
    url: 'https://github.com/Kaggle/kaggle-api/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} kaggle',
    ],
  },
}
