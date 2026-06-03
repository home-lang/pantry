import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/tmux/tmux',
  name: 'tmux',
  programs: [
    'tmux',
  ],
  dependencies: {
    'libevent.org': '^2.0',
    'invisible-island.net/ncurses': '*',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/tmux/tmux/releases/download/{{version.raw}}/tmux-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}} --disable-utf8proc',
      'make',
      'make install',
    ],
  },
  test: {
    script: [
      'tmux -V',
    ],
  },
}
