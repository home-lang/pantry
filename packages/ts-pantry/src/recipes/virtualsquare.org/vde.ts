import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'virtualsquare.org/vde',
  name: 'vde',
  programs: [
    'vde_autolink',
    'vde_over_ns',
    'vde_pcapplug',
    'vde_plug',
    'vde_plug2tap',
    'vde_router',
    'vde_switch',
    'vdecmd',
    'vdeterm',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '^2',
    'gnu.org/automake': '^1',
    'gnu.org/libtool': '^2.4',
  },
  distributable: {
    url: 'https://github.com/virtualsquare/vde-2/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf --install',
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
      ],
    },
  },
}
