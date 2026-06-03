import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "taku910.github.io/mecab",
  name: "mecab",
  programs: [
    "mecab",
    "mecab-config",
  ],
  distributable: {
    url: "https://deb.debian.org/debian/pool/main/m/mecab/mecab_{{version.raw}}.orig.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure $ARGS",
      "make --jobs {{ hw.concurrency }} install",
      {
        run: "cd {{prefix}}/bin\nsed -i.bak 's|{{prefix}}|\"$(cd \"$(dirname \"$0\")/..\" \\&\\& pwd)\"|' mecab-config\nrm mecab-config.bak\n",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-dependency-tracking",
      ],
    },
  },
}
