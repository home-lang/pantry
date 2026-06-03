import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'oberhumer.com/ucl',
  name: 'ucl',
  programs: [],
  buildDependencies: {
    'gnu.org/automake': '*',
  },
  distributable: {
    url: 'https://www.oberhumer.com/opensource/ucl/download/ucl-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cp -a {{deps.gnu.org/automake.prefix}}/share/automake-*/config.{sub,guess} acconfig/',
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
      CFLAGS: [
        '-Wno-implicit-function-declaration',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE -o test -lucl',
      './test',
    ],
  },
}
