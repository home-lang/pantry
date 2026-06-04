import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
    url: 'https://github.com/LunarVim/LunarVim/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/bash': '*',
    'crates.io/fd-find': '*',
    'pip.pypa.io': '*',
    'python.org': '^3',
    'nodejs.org': '*',
    'rust-lang.org/cargo': '*',
    'neovim.io': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'gnu.org/bash': '*',
  },

  build: {
    script: [
      './utils/installer/install.sh -y -l',
      './utils/installer/install_bin.sh',
      // Upstream's install-neovim-from-release downloads `nvim-linux64.tar.gz`
      // from neovim's `latest` release, but neovim renamed that asset to
      // `nvim-linux-x86_64.tar.gz`, so it now 404s. We already depend on
      // neovim.io, so symlink the provided nvim instead.
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "{{deps.neovim.io.prefix}}/bin/nvim" "{{prefix}}/bin/nvim"',
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
      'INSTALL_PREFIX': '{{prefix}}',
      'LV_INSTALL_PREFIX': '{{prefix}}',
      'XDG_DATA_HOME': '{{prefix}}/share',
      'XDG_CACHE_HOME': '{{prefix}}/.cache',
      'XDG_CONFIG_HOME': '{{prefix}}/.config',
    },
  },
}
