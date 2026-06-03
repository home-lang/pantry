import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leonerd.org.uk/libtermkey',
  name: 'libtermkey',
  programs: [],
  dependencies: {
    'github.com/neovim/unibilium': '*',
    'invisible-island.net/ncurses': '*',
  },
  buildDependencies: {
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    linux: {
      'gnome.org/glib': '*',
    },
  },
  distributable: {
    url: 'https://www.leonerd.org.uk/code/libtermkey/libtermkey-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARGS',
      'make $ARGS install',
    ],
    env: {
      ARGS: [
        'PREFIX={{prefix}}',
        '--jobs {{ hw.concurrency }}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion termkey | grep {{version.marketing}}',
    ],
  },
}
