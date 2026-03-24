import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'unbound.net',
  name: 'unbound',
  description: 'Unbound is a validating, recursive, and caching DNS resolver.',
  homepage: 'https://nlnetlabs.nl/unbound',
  github: 'https://github.com/NLnetLabs/unbound',
  programs: ['unbound', 'unbound-anchor', 'unbound-checkconf', 'unbound-control', 'unbound-control-setup', 'unbound-host'],
  versionSource: {
    type: 'github-releases',
    repo: 'NLnetLabs/unbound/tags',
    tagPattern: /\/^release-\//,
  },
  distributable: {
    url: 'https://github.com/NLnetLabs/unbound/archive/refs/tags/release-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1',
  },
  buildDependencies: {
    'libexpat.github.io': '*',
    'github.com/westes/flex': '*',
    'gnu.org/bison': '^3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make -j {{ hw.concurrency }} install',
      '',
      'cd {{prefix}}/bin',
      'sed -i.bak -e "s|$PKGX_DIR/|\\$PKGX_DIR/|g" unbound-control-setup',
      'rm unbound-control-setup.bak',
      '',
    ],
    env: {
      'ARGS': ['--prefix={{ prefix }}', '--sbindir={{ prefix }}/bin', '--with-ssl={{ deps.openssl.org.prefix }}', '--with-libexpat={{ deps.libexpat.github.io.prefix }}'],
    },
  },
}
