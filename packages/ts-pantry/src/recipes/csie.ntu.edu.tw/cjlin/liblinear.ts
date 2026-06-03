import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'csie.ntu.edu.tw/cjlin/liblinear',
  name: 'liblinear',
  programs: [
    'predict',
    'train',
  ],
  buildDependencies: {
    'gnu.org/make': '*',
    'curl.se': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://www.csie.ntu.edu.tw/~cjlin/liblinear/oldfiles/liblinear-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'curl $PATCH | patch -p0 || true',
      'make --jobs {{ hw.concurrency }} all',
      {
        run: 'mkdir -p bin lib include',
        'working-directory': '{{prefix}}',
      },
      'install predict train {{prefix}}/bin/',
      'install linear.h newton.h {{prefix}}/include/',
      'install liblinear* {{prefix}}/lib/',
    ],
    env: {
      PATCH: 'https://raw.githubusercontent.com/Homebrew/formula-patches/bac35ae9140405dec00f1f700d2ecc27cf82526b/liblinear/patch-Makefile.diff',
    },
  },
  test: {
    script: [
      'train train_classification.txt | grep "nSV = 5"',
    ],
  },
}
