import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ivarch.com/pv',
  name: 'pv',
  programs: [
    'pv',
  ],
  distributable: {
    url: 'https://www.ivarch.com/programs/sources/pv-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--mandir={{prefix}}/share/man',
        '--disable-nls',
      ],
      CFLAGS: '-Wno-implicit-function-declaration $CFLAGS',
    },
  },
  test: {
    script: [
      'pv --version | grep {{version}}',
      'input_data="Some example data for pv testing."',
      'echo "$input_data" | pv -p -e -s $(echo -n "$input_data" | wc -c)',
    ],
  },
}
