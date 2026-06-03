import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'oberhumer.com/lzo',
  name: 'lzo',
  programs: [],
  distributable: {
    url: 'https://www.oberhumer.com/opensource/lzo/download/lzo-{{ version.major }}.{{ version.minor }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make',
      'make check',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--enable-shared',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'gcc test.c -o test',
      'test "$(./test)" = \'Testing LZO v{{ version.major }}.{{ version.minor }} in tea.\'',
    ],
  },
}
