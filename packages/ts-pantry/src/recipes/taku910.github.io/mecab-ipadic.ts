import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'taku910.github.io/mecab-ipadic',
  name: 'mecab-ipadic',
  programs: [],
  dependencies: {
    'taku910.github.io/mecab': '*',
  },
  distributable: {
    url: 'https://deb.debian.org/debian/pool/main/m/mecab-ipadic/mecab-ipadic_2.7.0-20070801+main.orig.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-dependency-tracking',
        '--disable-debug',
        '--with-charset=utf8',
        '--with-dicdir={{prefix}}/lib/mecab/dic/ipadic',
      ],
    },
  },
  test: {
    script: [
      'touch mecabrc',
      'echo \'dicdir = {{prefix}}/lib/mecab/dic/ipadic\' > mecabrc',
      'echo "すもももももももものうち" | mecab --rcfile=mecabrc | grep \'詞\'',
    ],
  },
}
