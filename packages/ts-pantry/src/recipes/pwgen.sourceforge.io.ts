import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pwgen.sourceforge.io',
  name: 'pwgen',
  description: 'Password generator',
  homepage: 'https://pwgen.sourceforge.net/',
  programs: ['pwgen'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/pwgen/pwgen/{{version}}/pwgen-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--disable-dependency-tracking"', '--mandir="{{prefix}}/man"'],
    },
  },
}
