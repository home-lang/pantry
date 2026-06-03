import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bake-rs',
  name: 'bake-rs',
  programs: [
    'bake',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ali77gh/bake-rs/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'bake --version | grep \'{{version}}\'',
      'cp $FIXTURE bakefile.yaml',
      'bake hello',
      'bake hello | grep \'^hello$\'',
      'bake env-test --non-interactive',
      'bake env-test --non-interactive | grep \'failed to run\'',
      'PORT=eight-thousand bake env-test',
      'PORT=eight-thousand bake env-test | grep \'variable validation error\'',
      'PORT=8000 bake env-test',
      'PORT=8000 bake env-test | grep \'^8000$\'',
    ],
  },
}
