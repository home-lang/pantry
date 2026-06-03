import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mitsuhiko/when',
  name: 'when',
  programs: [
    'when',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
    'git-scm.org': '^2',
  },
  distributable: {
    url: 'git+https://github.com/mitsuhiko/when',
  },
  build: {
    script: [
      'git submodule update --init --recursive',
      'cargo install --locked --path ./cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(when --version)" = "when-cli {{version}}"',
      'when "now in vienna"',
    ],
  },
}
