import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/hykilpikonna/hyfetch",
  name: "hyfetch",
  programs: [
    "hyfetch",
  ],
  dependencies: {
    'pkgx.sh': ">=1",
  },
  buildDependencies: {
    'python.org': "~3.12",
    'rust-lang.org': "^1.75",
  },
  distributable: {
    url: "https://github.com/hykilpikonna/hyfetch/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "bkpyvenv stage {{prefix}} {{version}}\n${{prefix}}/venv/bin/pip install .\nbkpyvenv seal {{prefix}} hyfetch",
        if: "<2",
      },
      {
        run: "cargo install --locked --path crates/hyfetch --root {{prefix}}",
        if: ">=2",
      },
    ],
  },
  test: {
    script: [
      "hyfetch -C $FIXTURE --args=\"--config none --color-blocks off --disable wm de term gpu\"",
      "hyfetch --version | grep {{version}}",
    ],
  },
}
