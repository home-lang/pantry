import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sagiegurari.github.io/duckscript',
  name: 'duckscript',
  programs: [
    'duck',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/sagiegurari/duckscript/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path duckscript_cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'cp $FIXTURE hello.ds',
      'duck hello.ds',
      'pkgx hello.ds',
    ],
  },
}
