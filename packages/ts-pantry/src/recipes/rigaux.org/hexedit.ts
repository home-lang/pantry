import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rigaux.org/hexedit',
  name: 'hexedit',
  programs: [
    'hexedit',
  ],
  dependencies: {
    'invisible-island.net/ncurses': '6',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
  },
  distributable: {
    url: 'https://github.com/pixel/hexedit/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        // hexedit is a TUI with no --version flag; patch one in for testing
        run: 'sed -i -f $PROP hexedit.c',
        prop: '/streq(\\*argv, "-s")/i\\\n    if (streq(*argv, "-V") || streq(*argv, "--version")) { puts("hexedit {{version}}"); exit(0); } else',
      },
      './autogen.sh',
      './configure --prefix={{prefix}}',
      'make',
      'make install',
    ],
  },
}
