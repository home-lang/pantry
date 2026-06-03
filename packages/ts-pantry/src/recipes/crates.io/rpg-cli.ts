import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/rpg-cli',
  name: 'rpg-cli',
  programs: [
    'rpg-cli',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/facundoolano/rpg-cli/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'rpg-cli',
      'rpg-cli todo',
      'rpg-cli ls',
      'rpg-cli cd',
      'rpg-cli buy',
      'mkdir foo',
      'rpg-cli cd foo --run || true',
      'mkdir bar',
      'rpg-cli cd bar --run || true',
      'rpg-cli',
    ],
  },
}
