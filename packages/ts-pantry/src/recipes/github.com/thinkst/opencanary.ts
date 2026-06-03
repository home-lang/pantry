import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thinkst/opencanary',
  name: 'opencanary',
  programs: [
    'opencanaryd',
  ],
  dependencies: {
    'python.org': '>=3.10<3.12',
    'tcpdump.org': '*',
    'openssl.org': '*',
  },
  buildDependencies: {
    'pip.pypa.io': '*',
  },
  distributable: {
    url: 'https://github.com/thinkst/opencanary/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'pip install setuptools',
      'sed -i -e \'s/requirements = \\[/requirements = \\["scapy","pcapy-ng",/\' setup.py',
      {
        run: 'sed -i \'s/^__version__ = .*/__version__ = "{{version}}"/\' __init__.py',
        'working-directory': 'opencanary',
      },
      'python setup.py sdist',
      'python -m pip install --prefix={{prefix}} dist/opencanary-{{version}}.tar.gz',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib/',
      },
    ],
  },
}
