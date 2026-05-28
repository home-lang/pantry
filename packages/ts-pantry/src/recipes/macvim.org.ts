import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'macvim.org',
  name: 'macvim',
  description: 'Vim - the text editor - for macOS',
  homepage: 'https://macvim.org',
  github: 'https://github.com/macvim-dev/macvim',
  programs: ['gview', 'gvim', 'gvimdiff', 'gvimtutor', 'mview', 'mvim', 'mvimdiff', 'mvimtutor', 'view', 'vim', 'vimdiff', 'vimtutor'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'macvim-dev/macvim',
    tagPattern: /^release-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/macvim-dev/macvim/archive/release-{{version.major}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'cscope.sourceforge.io': '*',
    'invisible-island.net/ncurses': '*',
    'lua.org': '*',
    'libsodium.org': '*',
    'gnu.org/gettext': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      {
        run: 'cp -a $SRCROOT/src/MacVim/build/Release/MacVim.app .',
        'working-directory': '{{prefix}}/libexec',
      },
      {
        run: [
          'for file in {g,m,}{view,vim,vimdiff,vimtutor}; do',
          '  ln -s ../libexec/MacVim.app/Contents/bin/$file $file',
          'done',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      'CC': 'clang',
      'ARGS': [
        '--with-features=huge',
        '--enable-multibyte',
        '--enable-perlinterp',
        '--enable-rubyinterp',
        '--enable-tclinterp',
        '--enable-terminal',
        '--without-x',
        '--with-compiledby=tea.xyz',
        '--without-local-dir',
        '--enable-cscope',
        '--enable-luainterp',
        '--with-lua-prefix={{deps.lua.org.prefix}}',
        '--enable-luainterp',
        '--enable-python3interp',
        '--disable-sparkle',
        '--disable-gpm',
        '--disable-canberra',
        '--enable-fail-if-missing',
        '--with-macarchs=$(uname -m)',
        '--with-tlib=ncurses',
      ],
    },
  },
}
