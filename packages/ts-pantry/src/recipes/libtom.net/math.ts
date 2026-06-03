import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "libtom.net/math",
  name: "math",
  programs: [],
  buildDependencies: {
    'gnu.org/libtool': "^2.4.7",
  },
  distributable: {
    url: "https://github.com/libtom/libtommath/releases/download/{{version.tag}}/ltm-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      "make --file makefile.shared --jobs {{ hw.concurrency }} install",
    ],
    env: {
      PREFIX: "${{prefix}}",
    },
  },
  test: {
    script: [
      "cc $FIXTURE -ltommath\ntest \"$(./a.out)\" = \"Invalid error code\"",
    ],
  },
}
