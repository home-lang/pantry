import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/peltoche/lsd',
  name: 'lsd',
  programs: [
    'lsd',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Peltoche/lsd/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = ".*"$/version = "{{version}}"/\' Cargo.toml',
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(lsd --version)" = "lsd {{version}}"',
      'touch testfile',
      'test "$(lsd --oneline)" = "testfile"',
    ],
  },
}
