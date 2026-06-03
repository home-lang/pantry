import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pngquant.org/lib',
  name: 'lib',
  programs: [],
  buildDependencies: {
    'github.com/lu-zero/cargo-c': '*',
    'rust-lang.org/cargo': '*',
    'rust-lang.org': '^1.65',
  },
  distributable: {
    url: 'https://github.com/ImageOptim/libimagequant/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo cinstall --prefix {{prefix}}',
    ],
  },
  test: {
    script: [
      'cc test.c -limagequant -o test',
      './test',
    ],
  },
}
