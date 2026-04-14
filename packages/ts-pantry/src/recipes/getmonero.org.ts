import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getmonero.org',
  name: 'getmonero',
  programs: ['monero-wallet-rpc', 'monero-wallet-cli', 'monero-gen-trusted-multisig', 'monero-gen-ssl-cert', 'monerod', 'monero-blockchain-import', 'monero-blockchain-export', 'monero-blockchain-mark-spent-outputs', 'monero-blockchain-usage', 'monero-blockchain-ancestry', 'monero-blockchain-depth', 'monero-blockchain-stats', 'monero-blockchain-prune-known-spent-data', 'monero-blockchain-prune'],
  versionSource: {
    type: 'github-releases',
    repo: 'monero-project/monero',
  },
  distributable: {
    url: 'https://downloads.getmonero.org/cli/monero-source-{{version.tag}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '^1.66',
    'openssl.org': '^1.1',
    'libsodium.org': '*',
    'gnu.org/readline': '*',
    'unbound.net': '^1.4',
    'zeromq.org': '^4.2',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake -S .. $CMAKE_ARGS',
      'cmake --build .',
      'cmake --install .',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DARCH="default"', '-Wno-dev', '-DMANUAL_SUBMODULES=1'],
    },
  },
}
