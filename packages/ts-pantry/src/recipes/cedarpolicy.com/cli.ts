import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cedarpolicy.com/cli',
  name: 'cli',
  programs: [
    'cedar',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/cedar-policy/cedar/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP Cargo.toml */Cargo.toml',
        'working-directory': '..',
      },
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
