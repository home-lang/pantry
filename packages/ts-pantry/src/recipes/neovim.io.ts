import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'neovim.io',
  name: 'nvim',
  description: 'Ambitious Vim-fork focused on extensibility and agility',
  homepage: 'https://neovim.io/',
  github: 'https://github.com/neovim/neovim',
  programs: ['nvim'],
  versionSource: {
    type: 'github-releases',
    repo: 'neovim/neovim',
  },
  distributable: {
    url: 'https://github.com/neovim/neovim/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gettext': '^0',
    linux: {
      'gnu.org/libiconv': '^1.1',
    },
  },
  buildDependencies: {
    'cmake.org': '>=3.16',
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/libtool': '^2',
    'git-scm.org': '^2',
    'info-zip.org/unzip': '*',
  },

  build: {
    script: [
      {
        if: 'linux',
        'working-directory': 'cmake.deps/cmake',
        run: [
          'if test -f BuildLuarocks.cmake; then',
          '  sed -i.bak \\',
          '    -e "1i\\',
          '    set(RT_LIBDIR \\"$RT_LIBDIR\\")" \\',
          '    -e \'s/\\(build busted [0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\)/\\1 RT_LIBDIR=${RT_LIBDIR}/\' \\',
          '    BuildLuarocks.cmake',
          'fi',
        ],
      },
      'make CMAKE_BUILD_TYPE=RelWithDebInfo CMAKE_INSTALL_PREFIX={{prefix}} install',
    ],
    env: {
      'linux/aarch64': {
        RT_LIBDIR: '/usr/lib/aarch64-linux-gnu',
      },
      'linux/x86-64': {
        RT_LIBDIR: '/usr/lib/x86_64-linux-gnu',
      },
    },
  },
}
