import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/astanin/python-tabulate',
  name: 'python-tabulate',
  programs: [
    'tabulate',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/astanin/python-tabulate.git',
  },
  build: {
    script: [
      'rm -r props',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} tabulate',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/venv/lib',
      },
    ],
  },
  test: {
    script: [
      'tabulate -f grid $FIXTURE | grep \'| eggs | 451 |\'',
    ],
  },
}
