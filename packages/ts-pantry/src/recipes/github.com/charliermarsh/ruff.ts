import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/charliermarsh/ruff",
  name: "ruff",
  programs: [],
  buildDependencies: {
    'rust-lang.org': ">=1.60",
    'rust-lang.org/cargo': "*",
    'crates.io/semverator': "*",
  },
  distributable: {
    url: "https://github.com/astral-sh/ruff/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "if semverator lt {{version}} 0.0.242; then",
      "  CRATE=ruff_cli",
      "elif semverator lt {{version}} 0.1.14; then",
      "  CRATE=crates/ruff_cli",
      "else",
      "  CRATE=crates/ruff",
      "fi",
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
