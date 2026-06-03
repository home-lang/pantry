import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/DMTF/redfishtool',
  name: 'redfishtool',
  programs: [
    'redfishtool',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/DMTF/Redfishtool/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install -r requirements.txt',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} redfishtool',
    ],
  },
}
