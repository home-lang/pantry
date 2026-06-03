import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sr.ht/scdoc',
  name: 'scdoc',
  programs: [
    'scdoc',
  ],
  distributable: {
    url: 'https://git.sr.ht/~sircmpwn/scdoc/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} $ARGS',
      'make install $ARGS',
    ],
    env: {
      ARGS: [
        'PREFIX="{{prefix}}"',
        'LDFLAGS="$LDFLAGS"',
      ],
    },
  },
  test: {
    script: [
      'echo "" | (scdoc || true) | tee out',
      'echo -e "" >> out',
      'diff -u out $FIXTURE',
    ],
  },
}
