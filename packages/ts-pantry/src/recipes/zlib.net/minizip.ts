import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zlib.net/minizip',
  name: 'minizip',
  programs: [],
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '^2',
    'gnu.org/automake': '^1',
    'gnu.org/libtool': '^2',
  },
  distributable: {
    url: 'https://github.com/madler/zlib/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'contrib/minizip',
    script: [
      'autoreconf -fi',
      './configure --prefix={{prefix}}',
      'make install',
      'cp *.h {{prefix}}/include/minizip/',
    ],
  },
}
