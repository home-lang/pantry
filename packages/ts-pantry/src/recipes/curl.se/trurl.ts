import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curl.se/trurl',
  name: 'trurl',
  programs: [
    'trurl',
  ],
  dependencies: {
    'curl.se': '^7,^8',
  },
  buildDependencies: {
    'openssl.org': '^1.1',
  },
  distributable: {
    url: 'https://github.com/curl/trurl/archive/refs/tags/trurl-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# Makefile is not very flexible, so we have to edit it',
      'sed -i.bak -e "s/^\\(CFLAGS = .*\\)\\$/\\1 $CFLAGS/" Makefile',
      'rm Makefile.bak',
      'make',
      'mkdir -p {{prefix}}/bin',
      'mv trurl {{prefix}}/bin',
    ],
  },
}
