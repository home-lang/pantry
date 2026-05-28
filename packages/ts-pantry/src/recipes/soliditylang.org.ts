import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/soliditylang.org',
  domain: 'soliditylang.org',
  name: 'soliditylang',
  description: 'Solidity, the Smart Contract Programming Language',
  homepage: 'https://soliditylang.org',
  github: 'https://github.com/ethereum/solidity',
  programs: ['solc', 'yul-phaser'],
  versionSource: {
    type: 'github-releases',
    repo: 'ethereum/solidity',
  },
  distributable: {
    url: 'https://github.com/ethereum/solidity/releases/download//v{{version}}/solidity_{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '~1.84',
  },
  buildDependencies: {
    'cmake.org': '3',
    'gnu.org/patch': '*',
    'linux': {
      'gnu.org/gcc': '14',
    },
  },

  build: {
    workingDirectory: 'build',
    script: [
      // New libsolidity/lsb/DocumentHoverHandler.cpp doesn't like some versions of clang
      // (default argument issue)
      // https://github.com/ethereum/solidity/issues/13854
      { run: 'patch -p1 -d.. <../props/clang-error.diff', if: '=0.8.18' },
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      { run: 'rm {{prefix}}/bin/solidity-upgrade', if: '<0.8.18' },
    ],
    env: {
      // -DPEDANTIC=OFF: otherwise fails due to deprecations in boost ^1.81
      // -DSTRICT_Z3_VERSION=OFF: otherwise complains about Z3 version in cmake
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DPEDANTIC=OFF', '-DSTRICT_Z3_VERSION=OFF'],
    },
  },
}
