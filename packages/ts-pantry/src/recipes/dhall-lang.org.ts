import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dhall-lang.org',
  name: 'dhall',
  description: 'Interpreter for the Dhall language',
  homepage: 'https://dhall-lang.org/',
  programs: ['dhall'],
  distributable: {
    url: 'https://hackage.haskell.org/package/dhall-{{version}}/dhall-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cabal v2-update',
      'mkdir -p {{prefix}}/bin',
      'cabal v2-install $ARGS',
      'install -D man/dhall.1 {{prefix}}/share/man/man1/dhall.1',
    ],
  },
}
