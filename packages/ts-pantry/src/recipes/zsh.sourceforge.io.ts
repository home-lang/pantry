import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zsh.sourceforge.io',
  name: 'zsh',
  description: 'UNIX shell (command interpreter)',
  homepage: 'https://www.zsh.org/',
  programs: ['zsh'],
  distributable: {
    url: 'https://prdownloads.sourceforge.net/zsh/zsh/{{version.raw}}/zsh-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'invisible-island.net/ncurses': '*',
    'pcre.org': '*',
  },

  build: {
    script: [
      // We need to be able to set MODULE_PATH to the correct location, so we
      // have to break a small piece of zsh security.
      {
        run: [
          'sed -i.bak -e \'s/^\\(IPDEF8("MODULE_PATH",.*\\)PM_DONTIMPORT|\\(.*\\)$/\\1\\2/\' params.c',
          'rm params.c.bak',
        ],
        'working-directory': 'Src',
      },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--enable-fndir={{prefix}}/functions', '--enable-scriptdir={{prefix}}/scripts', '--enable-runhelpdir={{prefix}}/share/help', '--enable-cap', '--enable-maildir-support', '--enable-multibyte', '--enable-pcre', '--enable-zsh-secure-free', '--enable-unicode9', '--enable-etcdir=/etc', '--with-tcsetpgrp', 'DL_EXT=bundle'],
    },
  },
}
