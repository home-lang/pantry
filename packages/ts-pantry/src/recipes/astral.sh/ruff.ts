import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "astral.sh/ruff",
  name: "ruff",
  programs: [
    "ruff",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.91",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/astral-sh/ruff/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "CRATE=ruff_cli",
        if: "<0.0.242",
      },
      {
        run: "CRATE=crates/ruff_cli",
        if: ">=0.0.242<0.1.14",
      },
      {
        run: "CRATE=crates/ruff",
        if: ">=0.1.14",
      },
      "cargo install --locked --path $CRATE --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "mkdir -p .ruff_cache/{{version}}",
      "ruff -e $FIXTURE | grep \"\\`os\\` imported but unused\"\nruff --fix $FIXTURE",
      "(ruff check $FIXTURE || true) | grep \"\\`os\\` imported but unused\"\nruff check --fix $FIXTURE",
      "test ! -s $FIXTURE",
    ],
  },
}
