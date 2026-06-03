import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/igor-petruk/scriptisto",
  name: "scriptisto",
  programs: [
    "scriptisto",
  ],
  buildDependencies: {
    'rust-lang.org': "^1.75",
    'rust-lang.org/cargo': "^0.76",
  },
  distributable: {
    url: "https://github.com/igor-petruk/scriptisto/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --path . --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "scriptisto $FIXTURE | grep 'Current user: '\n",
    ],
  },
}
