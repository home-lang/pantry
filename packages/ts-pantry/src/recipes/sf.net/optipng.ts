import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sf.net/optipng',
  name: 'optipng',
  programs: [
    'optipng',
  ],
  dependencies: {
    'libpng.org': '^1',
    'zlib.net': '^1',
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/optipng/OptiPNG/optipng-{{version}}/optipng-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --with-system-zlib --with-system-libpng --prefix={{prefix}}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
