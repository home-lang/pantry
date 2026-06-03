import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.io/hatch',
  name: 'hatch',
  programs: [
    'hatch',
    'hatchling',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'git+https://github.com/pypa/hatch.git',
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} hatch hatchling',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/venv/lib',
      },
    ],
  },
  test: {
    script: [
      'hatch env create',
      'python -c \'import hatchling\'',
    ],
  },
}
