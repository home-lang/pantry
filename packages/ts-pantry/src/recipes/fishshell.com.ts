import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fishshell.com',
  name: 'fish',
  description: 'User-friendly command-line shell for UNIX-like operating systems',
  homepage: 'https://fishshell.com',
  github: 'https://github.com/fish-shell/fish-shell',
  programs: ['fish', 'fish_indent', 'fish_key_reader'],
  versionSource: {
    type: 'github-releases',
    repo: 'fish-shell/fish-shell',
  },
  distributable: {
    url: 'https://github.com/fish-shell/fish-shell/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gettext': '*',
    'invisible-island.net/ncurses': '>=6.0',
  },
  buildDependencies: {
    'cmake.org': '>=3.5',
    'freedesktop.org/pkg-config': '*',
    'gnu.org/patch': '*',
    'git-scm.org': '^2',
    'rust-lang.org': '^1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'patch -p1 <props/command_not_found_handler.diff',
      'echo {{version}} >version',
      'cd "build"',
      'cmake .. $ARGS',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}'],
    },
  },
}
