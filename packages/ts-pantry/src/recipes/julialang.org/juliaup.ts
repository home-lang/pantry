import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'julialang.org/juliaup',
  name: 'juliaup',
  programs: [
    'juliaup',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.61',
    'rust-lang.org/cargo': '^0',
  },
  distributable: {
    url: 'https://github.com/JuliaLang/juliaup/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
    env: {
      RUSTFLAGS: [
        '-A warnings',
        '-C debuginfo=0',
      ],
    },
  },
  test: {
    script: [
      'test "$(juliaup --version)" = "Juliaup {{version.raw}}"',
    ],
  },
}
