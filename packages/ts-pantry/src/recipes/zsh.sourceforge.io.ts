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
      'cd "Src"',
      'sed -i.bak -e \'s/^\\(IPDEF8("MODULE_PATH",.*\\)PM_DONTIMPORT|\\(.*\\)$/\\1\\2/\' params.c',
      'rm params.c.bak',
      '',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--enable-fndir={{prefix}}/functions', '--enable-scriptdir={{prefix}}/scripts', '--enable-runhelpdir=#{pkgshare}/help', '--enable-cap', '--enable-maildir-support', '--enable-multibyte', '--enable-pcre', '--enable-zsh-secure-free', '--enable-unicode9', '--enable-etcdir=/etc', '--with-tcsetpgrp', 'DL_EXT=bundle'],
    },
  },
}
