import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'lunarvim.org',
  name: 'lunarvim',
  description: '🌙 LunarVim is an IDE layer for Neovim. Completely free and community driven.',
  homepage: 'https://www.lunarvim.org',
  github: 'https://github.com/LunarVim/LunarVim',
  programs: ['lvim', 'nvim'],
  versionSource: {
    type: 'github-releases',
    repo: 'LunarVim/LunarVim',
  },
  distributable: {
    url: 'https://github.com/LunarVim/LunarVim/archive/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'crates.io/fd-find': '*',
    'pip.pypa.io': '*',
    'python.org': '^3',
    'nodejs.org': '*',
    'rust-lang.org/cargo': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      './utils/installer/install.sh -y -l',
      './utils/installer/install_bin.sh',
      'cd "${{prefix}}/share/lunarvim"',
      'rm lvim',
      'mkdir lvim',
      'cp -a "$SRCROOT"/* lvim/',
      '',
      'cd "${{prefix}}/bin"',
      'sed -i.bak "s_{{prefix}}_\\$(cd \\$(dirname \\$0)/.. \\&\\& pwd)_g" lvim',
      'rm lvim.bak',
      '',
    ],
    env: {
      'INSTALL_PREFIX': '{{ prefix }}',
      'LV_INSTALL_PREFIX': '{{ prefix }}',
      'XDG_DATA_HOME': '{{ prefix }}/share',
      'XDG_CACHE_HOME': '{{ prefix }}/.cache',
      'XDG_CONFIG_HOME': '{{ prefix }}/.config',
    },
  },
}
