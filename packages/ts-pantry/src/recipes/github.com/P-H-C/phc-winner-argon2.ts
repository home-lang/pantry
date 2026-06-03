import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/P-H-C/phc-winner-argon2',
  name: 'phc-winner-argon2',
  programs: [
    'argon2',
  ],
  distributable: {
    url: 'https://github.com/P-H-C/phc-winner-argon2/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARGS',
      'make test',
      'make install $ARGS',
      'mkdir -p {{prefix}}/share/doc/argon2',
      'mv argon2-specs.pdf {{prefix}}/share/doc/argon2/',
    ],
    env: {
      ARGS: [
        'PREFIX={{prefix}}',
        'ARGON2_VERSION={{version}}',
        'LIBRARY_REL=lib',
      ],
      'x86-64': {
        ARGS: [
          'OPTTARGET=core2',
        ],
      },
    },
  },
}
