import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libfontenc',
  name: 'libfontenc',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
    'zlib.net': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libfontenc-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make',
      'make install',
    ],
  },
  test: {
    script: [
      'pkg-config --modversion fontenc | grep {{version}}',
    ],
  },
}
