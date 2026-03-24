import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bcrypt.sourceforge.net',
  name: 'bcrypt',
  description: 'Cross platform file encryption utility using blowfish',
  homepage: 'https://bcrypt.sourceforge.net/',
  programs: ['bcrypt'],
  distributable: {
    url: 'https://bcrypt.sourceforge.net/bcrypt-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },

  build: {
    script: [
      'make LDFLAGS=-lz PREFIX={{prefix}} install',
    ],
  },
}
