import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/ddh",
  name: "ddh",
  programs: [
    "ddh",
  ],
  buildDependencies: {
    'rust-lang.org': "^1.65",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/darakian/ddh/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --path . --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "for x in A B C D E; do\n  echo $x >$x\n  echo $x >${x}_2\ndone\n",
      "ddh -d .",
      "cat Results.txt",
    ],
  },
}
