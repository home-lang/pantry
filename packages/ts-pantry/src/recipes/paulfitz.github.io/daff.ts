import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'paulfitz.github.io/daff',
  name: 'daff',
  programs: [
    'daff',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.7<3.12',
    'pip.pypa.io': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'pip download --no-deps --no-binary :all: --dest . daff=={{version}}',
      'tar zxvf daff-{{version}}.tar.gz --strip-components=1',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} daff',
    ],
  },
}
