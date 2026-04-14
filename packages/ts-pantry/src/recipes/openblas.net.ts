import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openblas.net',
  name: 'openblas',
  description: 'OpenBLAS is an optimized BLAS library based on GotoBLAS2 1.13 BSD version. ',
  homepage: 'https://www.openblas.net',
  github: 'https://github.com/xianyi/OpenBLAS',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'xianyi/OpenBLAS',
  },
  distributable: {
    url: 'https://github.com/xianyi/OpenBLAS/releases/download/{{version.tag}}/OpenBLAS-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'cd "${{prefix}}/include"',
      'if test -d openblas/openblas; then rm -r openblas/openblas; fi',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_C_FLAGS="-fPIC"', '-DCMAKE_CXX_FLAGS="-fPIC"'],
    },
  },
}
