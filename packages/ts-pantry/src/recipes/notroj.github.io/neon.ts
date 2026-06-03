import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'notroj.github.io/neon',
  name: 'neon',
  programs: [
    'neon-config',
  ],
  dependencies: {
    'openssl.org': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'freedesktop.org/pkg-config': '*',
    'pagure.io/xmlto': '*',
  },
  distributable: {
    url: 'https://notroj.github.io/neon/neon-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CFLAGS: '-Wno-implicit-function-declaration $CFLAGS',
      XML_CATALOG_FILES: '{{prefix}}/etc/xml/catalog',
      ARGS: [
        '--disable-debug',
        '--prefix={{prefix}}',
        '--enable-shared',
        '--disable-static',
        '--disable-nls',
        '--with-ssl=openssl',
        '--with-libs={{deps.openssl.org.prefix}}',
      ],
    },
  },
  test: {
    script: [
      'neon-config --version | grep {{version}}',
    ],
  },
}
