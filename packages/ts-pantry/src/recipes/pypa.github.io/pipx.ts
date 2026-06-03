import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.github.io/pipx',
  name: 'pipx',
  programs: [
    'pipx',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/pypa/pipx/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage \'{{prefix}}\' {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal \'{{prefix}}\' pipx',
    ],
  },
}
