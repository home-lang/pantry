import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/royreznik/rexi',
  name: 'rexi',
  programs: [
    'rexi',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.8',
  },
  distributable: {
    url: 'https://github.com/royreznik/rexi/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} rexi',
    ],
  },
  test: {
    script: [
      'rexi --help',
    ],
  },
}
