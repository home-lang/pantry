import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openai.com/codex',
  name: 'codex',
  programs: [
    'codex',
    'codex-exec',
    'codex-tui',
    'md-events',
  ],
  dependencies: {
    linux: {
      'kernel.org/libcap': '^1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '~1.94.0',
  },
  distributable: {
    url: 'https://github.com/openai/codex/archive/refs/tags/rust-v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path codex-rs/exec --root {{prefix}}',
      'cargo install --locked --path codex-rs/cli --root {{prefix}}',
      'cargo install --locked --path codex-rs/tui --root {{prefix}}',
    ],
    env: {
      OPENSSL_STATIC: 1,
      linux: {
        CARGO_BUILD_JOBS: 1,
        RUSTFLAGS: '-C codegen-units=1',
        CARGO_PROFILE_RELEASE_LTO: 'off',
      },
    },
  },
  test: {
    script: [
      'if ldd {{prefix}}/bin/codex | grep libssl; then echo "libssl linked"; exit 1; fi',
      'codex --help',
      'test "$(codex --version)" = "codex-cli {{version}}"',
    ],
  },
}
