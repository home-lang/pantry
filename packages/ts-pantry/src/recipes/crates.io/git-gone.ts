import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-gone',
  name: 'git-gone',
  programs: [
    'git-gone',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    // swsnr moved git-gone off GitHub to Codeberg; GitHub now 404s.
    url: 'https://codeberg.org/swsnr/git-gone/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(git-gone --version)" = "git-gone {{version}}"',
    ],
  },
}
