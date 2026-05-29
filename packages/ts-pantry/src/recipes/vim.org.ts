import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vim.org',
  name: 'vim',
  description: 'The official Vim repository',
  homepage: 'https://www.vim.org',
  github: 'https://github.com/vim/vim',
  programs: ['vim', 'vi'],
  versionSource: {
    type: 'github-releases',
    repo: 'vim/vim',
  },
  distributable: {
    url: 'https://github.com/vim/vim/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
    'lua.org': '>=5.4',
    'invisible-island.net/ncurses': '>=6.3',
    'perl.org': '>=5.36',
    'ruby-lang.org': '>=3.2',
  },
  buildDependencies: {
    'gnu.org/make': '^4.3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make',
      'make install prefix={{prefix}}',
      {
        run: 'ln -s vim vi',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--enable-multibyte', '--with-compiledby=tea.xyz', '--enable-cscope', '--enable-terminal', '--enable-perlinterp', '--enable-rubyinterp', '--enable-python3interp', '--disable-gui', '--without-x', '--enable-luainterp'],
      'linux': {
        'ARGS': ['--with-tlib=tinfow'],
      },
      'darwin': {
        'ARGS': ['--with-tlib=ncurses'],
      },
    },
  },
}
