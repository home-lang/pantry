import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rucio.cern.ch/rucio-client',
  name: 'rucio-client',
  programs: [
    'rucio',
    'rucio-admin',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'gnu.org/bash': '^5',
    'python.org': '>=3.9<3.13',
    'postgresql.org': '*',
  },
  distributable: {
    url: 'https://github.com/rucio/rucio/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install setuptools wheel',
      './tools/build_sdist*.sh clients',
      {
        run: '${{prefix}}/venv/bin/python setup.py install',
        if: '<39',
      },
      {
        run: '${{prefix}}/venv/bin/python setuputil.py install',
        if: '>=39',
      },
      {
        run: '${{prefix}}/venv/bin/pip install dogpile.cache',
        if: '>=35',
      },
      {
        run: '${{prefix}}/venv/bin/pip install click',
        if: '>=37',
      },
      {
        run: '${{prefix}}/venv/bin/pip install rucio[mysql,postgresql,sqlite,ldap,webui,webapi,vo]=={{version}}',
        if: '>=35',
      },
      'bkpyvenv seal {{prefix}} rucio rucio-admin',
    ],
  },
  test: {
    script: [
      'test "$(rucio --version | tail -n1 |cut -d\' \' -f 2)" = {{version}}',
      'test "$(rucio-admin --version | tail -n1 |cut -d\' \' -f 2)" = {{version}}',
    ],
  },
}
