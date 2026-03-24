import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pipenv.pypa.io',
  name: 'pipenv',
  description: ' Python Development Workflow for Humans.',
  homepage: 'https://pipenv.pypa.io',
  github: 'https://github.com/pypa/pipenv',
  programs: ['pipenv'],
  versionSource: {
    type: 'github-releases',
    repo: 'pypa/pipenv',
  },
  distributable: {
    url: 'https://github.com/pypa/pipenv/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.11',
    'crates.io/semverator': '*',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} pipenv',
      'cd "${{prefix}}/lib"',
      'cp -a {{deps.python.org.prefix}}/lib/libpython* .',
      'cd "${{prefix}}/bin"',
      'v=3.6',
      'vMax=3.14',
      'while semverator lt $v $vMax; do',
      '  v=$(semverator bump $v minor | cut -d. -f1,2)',
      '  echo \'#!/bin/sh\' > python$v',
      '  echo "exec pkgx python~$v \\"\\$@\\"" >> python$v',
      '  chmod +x python$v',
      'done',
      '',
    ],
  },
}
