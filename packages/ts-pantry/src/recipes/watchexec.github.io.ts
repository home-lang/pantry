import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'watchexec.github.io',
  name: 'watchexec',
  description: 'Executes commands in response to file modifications',
  homepage: 'https://watchexec.github.io/',
  github: 'https://github.com/watchexec/watchexec',
  programs: ['watchexec'],
  versionSource: {
    type: 'github-releases',
    repo: 'watchexec/watchexec',
  },
  distributable: {
    url: 'https://github.com/watchexec/watchexec/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'linux/aarch64': {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      // linux/aarch64 looks for aarch64-linux-gnu-gcc
      {
        run: 'ln -s {{deps.gnu.org/gcc.prefix}}/bin/aarch64-unknown-linux-gnu-gcc aarch64-linux-gnu-gcc',
        'working-directory': '$HOME/.local/bin',
        if: 'linux/aarch64',
      },
      'cargo install --locked --path crates/cli --root {{prefix}}',
    ],
    env: {
      PATH: '$HOME/.local/bin:$PATH',
    },
  },
}
