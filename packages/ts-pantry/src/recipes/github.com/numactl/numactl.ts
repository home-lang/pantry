import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/numactl/numactl',
  name: 'numactl',
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': 2,
    'gnu.org/automake': 1,
    'gnu.org/libtool': 2,
    'gnu.org/m4': 1,
  },
  distributable: {
    url: 'https://github.com/numactl/numactl/archive/refs/tags/v{{ version }}/numactl-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ACLOCAL_PATH: '${{ deps.gnu.org/libtool.prefix }}/share/aclocal',
    },
  },
  test: {
    script: [
      'cc -lnuma mynode.c',
      './a.out',
    ],
  },
}
