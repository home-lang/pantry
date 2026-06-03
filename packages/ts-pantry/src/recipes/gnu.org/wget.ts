import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/wget',
  name: 'wget',
  programs: [
    'wget',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/wget/wget-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-pcre',
        '--disable-pcre2',
        '--without-libps1',
        '--without-included-regex',
        '--with-ssl=openssl',
      ],
    },
  },
}
