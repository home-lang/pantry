import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "pkgx.sh/brewkit",
  name: "brewkit",
  programs: [
    "bk",
  ],
  dependencies: {
    'deno.land': "~1.39",
    'gnu.org/bash': "^5",
    'pkgx.sh': ">=1",
  },
  distributable: {
    url: "https://github.com/pkgxdev/brewkit/archive/refs/tags/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}",
      "for x in $PARTS; do\n  test -e $x && cp -a $x \{{prefix}}\\ndone\n",
    ],
    env: {
      PARTS: [
        "bin",
        "libexec",
        "lib",
        "share",
        "deno.*",
        "audit",
        "build",
        "test",
      ],
    },
  },
  test: {
    script: [
      "bk --help",
      "bk build --help",
    ],
  },
}
