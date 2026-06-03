import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-tidy',
  name: 'git-tidy',
  programs: [
    'git-tidy',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/drewwyatt/git-tidy/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'git clone https://github.com/kelseyhightower/nocode',
      'cd nocode',
      'git tidy',
      'test "$(git tidy --version)" = "git-tidy {{version}}"',
      'cd ..',
      'rm -rf nocode',
    ],
  },
}
