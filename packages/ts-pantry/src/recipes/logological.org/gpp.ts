import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'logological.org/gpp',
  name: 'gpp',
  programs: [
    'gpp',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '*',
  },
  distributable: {
    url: 'https://github.com/logological/gpp/releases/download/{{ version.marketing }}/gpp-{{ version.marketing }}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
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
      'gpp --version | grep {{version.marketing}}',
    ],
  },
}
