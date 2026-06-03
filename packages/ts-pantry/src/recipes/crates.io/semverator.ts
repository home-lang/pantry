import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/semverator",
  name: "semverator",
  programs: [
    "semverator",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/jhheider/semverator/archive/refs/tags/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "cargo install --locked --path . --root {{prefix}}",
        if: "<0.6.0",
      },
      {
        run: "cargo install --locked --path cli --root {{prefix}}\ncargo build --release --locked --package libsemverator\nmkdir -p {{prefix}}/lib\ncd target/release\nfor x in liblibsemverator.*; do\n  cp $x {{prefix}}/lib/${x#lib}\ndone\n",
        if: ">=0.6.0",
      },
    ],
  },
  test: {
    script: [
      "semverator validate 1.2.3",
      "semverator eq 1.2.3 1.2.3",
      "semverator neq 1.2.3 1.2.4",
      "semverator gt 1.2.3 1.2.2",
      "semverator lt 1.2.3 1.2.4",
      "test ! $(semverator validate 1.2.three)",
      "test ! $(semverator eq 1.2.3 1.2.4)",
      "test ! $(semverator neq 1.2.3 1.2.3)",
      "test ! $(semverator gt 1.2.3 1.2.4)",
      "test ! $(semverator lt 1.2.3 1.2.2)",
    ],
  },
}
