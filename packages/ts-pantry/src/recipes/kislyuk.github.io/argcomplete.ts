import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kislyuk.github.io/argcomplete',
  name: 'argcomplete',
  programs: [
    'activate-global-python-argcomplete',
    'register-python-argcomplete',
    'python-argcomplete-check-easy-install-script',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'git+https://github.com/kislyuk/argcomplete.git',
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install setuptools wheel',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} activate-global-python-argcomplete register-python-argcomplete python-argcomplete-check-easy-install-script',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/venv/lib',
      },
    ],
  },
  test: {
    script: [
      'register-python-argcomplete foo | grep \'_python_argcomplete foo\'',
      'python -c \'import argcomplete;\'',
    ],
  },
}
