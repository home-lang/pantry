import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/stub42/pytz',
  name: 'pytz',
  programs: [],
  dependencies: {
    'python.org': '~3.12',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gawk': '*',
      'rsync.samba.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/stub42/pytz/archive/release_{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python -m pip install setuptools wheel',
      'sed -i \'s|/usr/bin/||g\' Makefile',
      'make dist',
      {
        run: 'python -m pip install --prefix={{prefix}} .',
        'working-directory': 'src',
      },
    ],
    env: {
      linux: {
        CC: 'clang',
      },
    },
  },
  test: {
    script: [
      'python -c \'import pytz; print(pytz.__version__)\' | grep {{version.raw}}',
      'python -c \'import pytz; print(pytz.timezone("UTC"))\' | grep UTC',
    ],
  },
}
