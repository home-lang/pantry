import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
  },

  build: {
    script: [
      'patch -p1 -d.. <../props/clang-error.diff',
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'rm {{prefix}}/bin/solidity-upgrade',
    ],
    env: {
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DPEDANTIC=OFF', '-DSTRICT_Z3_VERSION=OFF'],
    },
  },
}
