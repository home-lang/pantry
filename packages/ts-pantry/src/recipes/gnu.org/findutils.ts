import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/findutils',
  name: 'findutils',
  programs: [
    'find',
    'locate',
    'updatedb',
    'xargs',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/findutils/findutils-{{version}}.tar.xz',
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
        '--localstatedir={{prefix}}/var/locate',
        '--disable-dependency-tracking',
        '--disable-nls',
        '--with-packager=Tea.xyz',
        '--with-packager-bug-reports=https://github.com/teaxyz/pantry/issues',
      ],
    },
  },
}
