import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/net-tools',
  platforms: ['linux'],
  name: 'net-tools',
  programs: [
    'hostname',
    'ifconfig',
    'netstat',
    'route',
  ],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/net-tools/net-tools-{{version.marketing}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'/IFS=\'\\\'\'@\'\\\'\' read ans || exit 1/d\' configure.sh',
      'make config',
      'make',
      'make $ARGS install',
    ],
    env: {
      ARGS: [
        'DESTDIR="{{prefix}}"',
      ],
    },
  },
}
