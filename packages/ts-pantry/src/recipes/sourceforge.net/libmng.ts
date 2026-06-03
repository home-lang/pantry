import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/libmng',
  name: 'libmng',
  programs: [],
  dependencies: {
    'libjpeg-turbo.org': '*',
    'littlecms.com': '>=2.0.0',
    'zlib.net': '*',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/libmng/libmng-devel/{{version}}/libmng-{{version}}.tar.gz',
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
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion libmng | grep {{version}}',
    ],
  },
}
