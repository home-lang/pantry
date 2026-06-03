import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'invisible-island.net/lynx',
  name: 'lynx',
  programs: [
    'lynx',
  ],
  dependencies: {
    'openssl.org': '^3',
    'invisible-island.net/ncurses': '^6',
  },
  distributable: {
    url: 'https://invisible-island.net/archives/lynx/tarballs/lynx{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-echo',
        '--enable-default-colors',
        '--with-zlib',
        '--with-bzlib',
        '--enable-ipv6',
        '--with-screen=ncurses',
        '--enable-externs',
        '--disable-config-info',
        '--with-ssl={{deps.openssl.org.prefix}}',
        '--with-curses={{deps.invisible-island.net/ncurses.prefix}}',
      ],
    },
  },
}
