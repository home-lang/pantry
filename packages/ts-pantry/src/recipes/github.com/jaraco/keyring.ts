import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jaraco/keyring',
  name: 'keyring',
  programs: [
    'keyring',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
    'github.com/python-cffi/cffi': '^1.16',
    'github.com/eliben/pycparser': '^2.21',
    'cryptography.io': '^42',
  },
  buildDependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/jaraco/keyring.git',
  },
  build: {
    script: [
      'if test -d props; then rm -rf props; fi',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} keyring',
    ],
  },
}
