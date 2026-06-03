import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "stedolan.github.io/jq",
  name: "jq",
  programs: [
    "jq",
  ],
  dependencies: {
    'github.com/kkos/oniguruma': 6,
  },
  buildDependencies: {
    'git-scm.org': 2,
  },
  distributable: {
    url: "https://github.com/jqlang/jq/releases/download/jq-{{version.raw}}/jq-{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test \"{{hw.platform}}\" = \"darwin\"; then\n  git apply props/darwin.diff\n  git apply props/lgamma_r.diff\nfi\n",
        if: "<1.7",
      },
      "./configure --disable-maintainer-mode --prefix={{prefix}}",
      "make -j {{hw.concurrency}}",
      "make install",
    ],
  },
  test: {
    script: [
      "test $(jq .devs[1].github < test.json) = '\"jhheider\"'",
    ],
  },
}
