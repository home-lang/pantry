import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dhruvkb.dev/pls',
  name: 'pls',
  programs: [
    'pls',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    // beta.3's Cargo.lock pins a git dependency (dhruvkb/rust-users.git at a
    // dead revision) whose repo no longer exists (404), so cargo cannot fetch
    // it. beta.13 dropped that git dependency and builds cleanly.
    url: 'https://github.com/pls-rs/pls/archive/refs/tags/v0.0.1-beta.13.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(pls --version 2>&1 || true)" = "pls 0.0.1-beta.13"',
    ],
  },
}
