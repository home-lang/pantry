import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mamba-org/mamba',
  name: 'mamba',
  programs: [
    'mamba',
  ],
  buildDependencies: {
    'aria2.github.io': '1.36',
  },
  distributable: {
    url: 'https://github.com/conda-forge/miniforge/archive/refs/tags/22.11.1-4.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '#FIXME mamba provides sha256 signatures, should we check against them before building?',
      '#      ^ https://github.com/conda-forge/miniforge/releases',
      '# download mamba installation script',
      'aria2c -c -o mamba.sh "https://github.com/conda-forge/miniforge/releases/download/22.11.1-4/Mambaforge-22.11.1-4-$PLATFORM.sh"',
      '# install mamba',
      'chmod +x mamba.sh',
      './mamba.sh $ARGS',
      'fix-shebangs.ts {{prefix}}/bin/*',
      '#FIXME: add caveats',
      '# Please run the following to setup your shell:',
      '# mamba init "$(basename "${SHELL}")"   # updates your .zshrc or .bashrc to make mamba & conda usable',
    ],
    env: {
      'darwin/aarch64': {
        PLATFORM: 'MacOSX-arm64',
      },
      'darwin/x86-64': {
        PLATFORM: 'MacOSX-x86_64',
      },
      'linux/aarch64': {
        PLATFORM: 'Linux-aarch64',
      },
      'linux/x86-64': {
        PLATFORM: 'Linux-x86_64',
      },
      ARGS: [
        '-b',
        '-s',
        '-u',
        '-p {{prefix}}',
      ],
    },
  },
}
