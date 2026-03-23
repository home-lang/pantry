import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nmap.org',
  name: 'nmap',
  description: 'Port scanning utility for large networks',
  homepage: 'https://nmap.org/',
  programs: ['nmap', 'ncat', 'nping'],
  distributable: {
    url: 'https://nmap.org/dist/nmap-{{version.raw}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'pcre.org/v2': '^10',
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'python.org': '3',
  },

  build: {
    script: [
      'patch -p1 <props/openssl-1.1.1.patch',
      'python -m venv $HOME/venv',
      'source $HOME/venv/bin/activate',
      'python -m pip install build setuptools',
      './configure $ARGS',
      'cd "libpcap"',
      'sed -i \'s|/VERSION`|/VERSION.txt`|\' Makefile',
      'make -j {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--with-libpcre={{deps.pcre.org/v2.prefix}}', '--without-zenmap'],
    },
  },
}
