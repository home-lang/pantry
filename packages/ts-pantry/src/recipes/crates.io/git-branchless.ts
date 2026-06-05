import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-branchless',
  name: 'git-branchless',
  programs: [
    'git-branchless',
  ],
  dependencies: {
    'libgit2.org': '1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/arxanas/git-branchless/archive/refs/tags/v{{ version }}.tar.gz',
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
      'git branchless init',
      'test "$(git branchless --version)" = "git-branchless-opts {{version}}"',
      'git branchless init --uninstall',
      'cd ..',
      'rm -rf nocode',
    ],
  },
}
