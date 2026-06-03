import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'webmproject.org/libvpx',
  name: 'libvpx',
  programs: [],
  buildDependencies: {
    'yasm.tortall.net': '*',
  },
  distributable: {
    url: 'https://github.com/webmproject/libvpx/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
        '--disable-examples',
        '--disable-unit-tests',
        '--enable-pic',
        '--enable-shared',
        '--enable-vp9-highbitdepth',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion vpx | grep {{version}}',
    ],
  },
}
