import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libxfont2',
  name: 'libxfont2',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
    'freetype.org': '*',
    'x.org/xtrans': '*',
    'zlib.net': '*',
    'x.org/libfontenc': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXfont2-{{version}}.tar.gz',
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
      'pkg-config --modversion xfont2 | grep {{version}}',
    ],
  },
}
