import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lu-zero/cargo-c',
  name: 'cargo-c',
  programs: [
    'cargo-capi',
    'cargo-cbuild',
    'cargo-cinstall',
    'cargo-ctest',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
    'libssh2.org': '*',
    'openssl.org': '^1.1',
    'zlib.net': '*',
    'curl.se': 8,
  },
  buildDependencies: {
    'rust-lang.org': '^1.70',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/lu-zero/cargo-c/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      LIBGIT2_SYS_USE_PKG_CONFIG: 1,
      LIBSSH2_SYS_USE_PKG_CONFIG: 1,
      OPENSSL_NO_VENDOR: 1,
      OPENSSL_DIR: '{{deps.openssl.org.prefix}}',
      ARGS: [
        '--root {{prefix}}',
        '--locked',
        '--path .',
      ],
    },
  },
}
