import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sanitize',
  name: 'sanitize',
  programs: [
    'sanitize',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/jhheider/sanitize/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'mkdir -p foo/foo',
      'touch foo/bar foo/bat foo/foo/bat foo/foo/bar',
      'sanitize foo -f $FIXTURE -y',
      'test "$(find foo | sort)" = "$OUT"',
    ],
  },
}
