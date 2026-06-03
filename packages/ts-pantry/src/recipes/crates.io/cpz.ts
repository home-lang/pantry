import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/cpz',
  name: 'cpz',
  programs: [
    'cpz',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '^0.86',
  },
  distributable: {
    url: 'https://github.com/SUPERCILEX/fuc/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path cpz --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'mkdir -p a/b/c/d/e',
      'echo aaa > a/b/c/d/e/f',
      'echo aaa > a/b/c/d/e/g',
      'cpz a a2',
      'difft a a2 --check-only --exit-code',
    ],
  },
}
