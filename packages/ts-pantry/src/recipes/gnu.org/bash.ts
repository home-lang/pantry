import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/bash',
  name: 'bash',
  programs: [
    'bash',
    'bashbug',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/bash/bash-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CFLAGS: [
        '-DSSH_SOURCE_BASHRC',
        '-Wno-implicit-function-declaration',
      ],
      darwin: {
        LDFLAGS: '$LDFLAGS -Wl,-headerpad_max_install_names',
      },
    },
  },
  test: {
    script: [
      'bash --version | tee out',
      'grep {{version}} out',
      'bash -c "set -o pipefail"',
    ],
  },
}
