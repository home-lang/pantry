import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pagure.io/xmlto',
  name: 'xmlto',
  programs: [
    'xmlif',
    'xmlto',
  ],
  dependencies: {
    'docbook.org': '*',
    'github.com/util-linux/util-linux': '*',
    darwin: {
      'gnome.org/libxslt': '*',
    },
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
  },
  distributable: {
    url: 'https://releases.pagure.org/xmlto/xmlto-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'test -f configure || autoreconf -vfi',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install-exec',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'xmlto --version | grep {{version}}',
    ],
  },
}
