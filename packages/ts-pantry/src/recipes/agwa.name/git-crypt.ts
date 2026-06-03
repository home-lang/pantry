import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'agwa.name/git-crypt',
  name: 'git-crypt',
  programs: [
    'git-crypt',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'docbook.org': '*',
    'docbook.org/xsl': '*',
    'gnome.org/libxslt': '*',
  },
  distributable: {
    url: 'https://www.agwa.name/projects/git-crypt/downloads/git-crypt-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i "s|http://docbook.sourceforge.net/release/xsl/current|{{deps.docbook.org/xsl.prefix}}/libexec/docbook-xsl|g" Makefile',
      'make ENABLE_MAN=yes PREFIX={{prefix}} install',
    ],
    env: {
      XML_CATALOG_FILES: '${{prefix}}/etc/xml/catalog',
      CFLAGS: '$CFLAGS -DOPENSSL_API_COMPAT=0x30000000L',
    },
  },
  test: {
    script: [
      'git-crypt keygen keyfile',
      'ls | grep keyfile',
      'git-crypt version | grep {{version}}',
    ],
  },
}
