import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/dduan/tre',
  name: 'tre',
  programs: [
    'tre',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/dduan/tre/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      '# prepare for tests',
      'mkdir -p foo/bar',
      'mkdir -p foo/buzz',
      'touch foo/buzz/lupus.txt',
      '# run tests',
      'test "$(tre --version)"=\'tre-command {{version}}\'',
      'out="$(tre . --all)"',
      'echo $out | grep lupus.txt  # test for files found',
      'echo $out | grep bar        # test for level 2 dirs found',
      'echo $out | grep buzz       # ^',
      'tre --all',
    ],
  },
}
