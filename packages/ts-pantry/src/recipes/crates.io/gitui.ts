import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitui',
  name: 'gitui',
  programs: [
    'gitui',
  ],
  dependencies: {
    'perl.org': '*',
    'openssl.org': '^1.1',
    'zlib.net': '^1',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '^1.78',
    'rust-lang.org/cargo': '*',
    'cmake.org': '3',
  },
  distributable: {
    url: 'https://github.com/extrawurst/gitui/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --locked --root {{prefix}}',
    ],
    env: {
      linux: {
        AR: 'llvm-ar',
        RUSTFLAGS: '-C linker=cc',
        OPENSSL_NO_VENDOR: '1',
        OPENSSL_DIR: '{{ deps.openssl.org.prefix }}',
      },
    },
  },
}
