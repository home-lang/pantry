import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rust-lang.org/rustup',
  name: 'rustup',
  programs: [
    'rustup',
    'rustup-init',
  ],
  dependencies: {
    linux: {
      'curl.se': '*',
    },
    'openssl.org': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.85',
    'rust-lang.org/cargo': '^0.86',
  },
  distributable: {
    url: 'https://github.com/rust-lang/rustup/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/"curl-backend",//\' Cargo.toml',
        if: 'darwin',
      },
      'cargo install --locked --path . --root {{prefix}}',
      {
        run: 'ln -s rustup-init rustup',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      RUSTUP_INIT_SKIP_PATH_CHECK: 'yes',
    },
  },
  test: {
    script: [
      'rustup --version',
      'rustup default nightly',
    ],
  },
}
