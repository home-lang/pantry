import type { Recipe } from '../../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git.osgeo.org/gitea/rttopo/librttopo',
  name: 'librttopo',
  programs: [],
  dependencies: {
    'libgeos.org': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://git.osgeo.org/gitea/rttopo/librttopo/archive/librttopo-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure --disable-debug \\',
      '  --disable-dependency-tracking \\',
      '  --disable-silent-rules \\',
      '  --prefix={{prefix}}',
      'make install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -lrttopo -o test',
      'test $(./test) = {{version}}',
    ],
  },
}
