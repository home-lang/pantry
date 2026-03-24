import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tcsh.org',
  name: 'tcsh',
  description: 'Enhanced, fully compatible version of the Berkeley C shell',
  homepage: 'https://www.tcsh.org/',
  programs: ['csh', 'tcsh'],
  distributable: {
    url: 'https://astron.com/pub/tcsh/tcsh-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/besser82/libxcrypt': '4',
    'invisible-island.net/ncurses': '6',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'cd "${{prefix}}/bin"',
      'ln -s tcsh csh',
      'cd "${{prefix}}"',
      'mkdir etc',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--sysconfdir={{prefix}}/etc'],
    },
  },
}
