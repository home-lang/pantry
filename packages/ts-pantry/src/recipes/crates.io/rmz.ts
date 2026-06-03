import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/rmz",
  name: "rmz",
  programs: [
    "rmz",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.85",
    'rust-lang.org/cargo': "^0.86",
  },
  distributable: {
    url: "https://github.com/SUPERCILEX/fuc/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --locked --path rmz --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "touch a\nrmz a\ntest ! -f a\nexit\n",
      "mkdir a",
      "touch a/b",
      "test -f a/b",
      "rmz a",
      "test ! -d a",
    ],
  },
}
