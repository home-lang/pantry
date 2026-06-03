import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cookiecutter/cookiecutter',
  name: 'cookiecutter',
  programs: [
    'cookiecutter',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'https://github.com/cookiecutter/cookiecutter/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} cookiecutter',
    ],
  },
  test: {
    script: [
      'git clone https://github.com/audreyr/cookiecutter-pypackage.git',
      'cookiecutter --no-input cookiecutter-pypackage',
      'test -d python_boilerplate || test -d python-boilerplate',
      'cookiecutter --version | tee out',
      'grep {{version}} out',
    ],
  },
}
