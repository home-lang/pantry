import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitu',
  name: 'gitu',
  programs: [
    'gitu',
  ],
  dependencies: {
    'zlib.net': '~1.3',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/altsem/gitu/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/git_version::git_version!(cargo_suffix = "")/"{{version}}"/\' main.rs',
        'working-directory': 'src',
      },
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(gitu --version)" = "gitu {{version}}"',
      'gitu --help',
    ],
  },
}
