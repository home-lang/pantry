import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bitcoin.org',
  name: 'bitcoin',
  description: 'Decentralized, peer to peer payment network',
  homepage: 'https://bitcoincore.org/',
  github: 'https://github.com/bitcoin/bitcoin',
  programs: ['bitcoin-cli', 'bitcoin-tx', 'bitcoin-util', 'bitcoin-wallet', 'bitcoind'],
  versionSource: {
    type: 'github-releases',
    repo: 'bitcoin/bitcoin',
    tagPattern: /^Bitcoin Core (.+)$/,
  },
  distributable: {
    url: 'https://bitcoincore.org/bin/bitcoin-core-{{version.raw}}/bitcoin-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'oracle.com/berkeley-db': '^18',
    'boost.org': '^1',
    'libevent.org': '^2',
    'zeromq.org': '^4',
    'sqlite.org': '^3',
  },
  buildDependencies: {
    'gnu.org/autoconf': '^2',
    'gnu.org/automake': '^1',
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/libtool': '^2',
    'cmake.org': '^3.22',
    'ninja-build.org': '*',
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "build"',
      'cmake -B . -S .. $CMAKE_ARGS',
      'cmake --build .',
      'cmake --install . --prefix {{prefix}}',
      'cd "{{prefix}}/bin"',
      'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so bitcoin-wallet || true',
      'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so bitcoind || true',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-tests', '--disable-bench'],
      'CMAKE_ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DBUILD_TESTS=OFF', '-DBUILD_BENCH=OFF', '-Wno-dev', '-GNinja', '-DBoost_INCLUDE_DIR={{deps.boost.org.prefix}}/include', '-DBUILD_TX=ON', '-DBUILD_UTIL=ON', '-DBUILD_WALLET_TOOL=ON', '-DENABLE_IPC=OFF'],
    },
  },
}
