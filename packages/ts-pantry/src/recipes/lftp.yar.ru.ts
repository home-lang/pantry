import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lftp.yar.ru',
  name: 'lftp',
  description: 'sophisticated command line file transfer program (ftp, http, sftp, fish, torrent)',
  homepage: 'https://lftp.yar.ru/',
  github: 'https://github.com/lavv17/lftp',
  programs: ['lftp', 'lftpget'],
  versionSource: {
    type: 'github-releases',
    repo: 'lavv17/lftp',
  },
  distributable: {
    url: 'http://ftp.st.ryukoku.ac.jp/pub/network/ftp/lftp/lftp-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libidn2': '*',
    'gnu.org/gettext': '*',
    'gnu.org/readline': '*',
    'openssl.org': '^1.1',
    'zlib.net': '*',
    'invisible-island.net/ncurses': '*',
    'libexpat.github.io': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--with-openssl="{{deps.openssl.org.prefix}}"', '--with-readline="{{deps.gnu.org/readline.prefix}}"', '--with-libidn2="{{deps.gnu.org/libidn2.prefix}}"'],
    },
  },
}
