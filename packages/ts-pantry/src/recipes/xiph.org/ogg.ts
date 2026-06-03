import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xiph.org/ogg',
  name: 'ogg',
  programs: [],
  distributable: {
    url: 'https://downloads.xiph.org/releases/ogg/libogg-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'wget https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg -O test.ogg',
      'mv $FIXTURE test.c',
      'cc test.c -logg',
      './a.out < test.ogg',
    ],
  },
}
