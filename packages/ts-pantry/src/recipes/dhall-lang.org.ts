import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dhall-lang.org',
  name: 'dhall',
  description: 'Interpreter for the Dhall language',
  homepage: 'https://dhall-lang.org/',
  programs: ['dhall'],
  dependencies: {
    'invisible-island.net/ncurses': '^6.4',
    'zlib.net': '^1.3',
  },
  buildDependencies: {
    'haskell.org': '~9.8',
    'haskell.org/cabal': '*',
  },
  distributable: {
    url: 'https://hackage.haskell.org/package/dhall-{{version}}/dhall-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      {
        // zlib 0.7.0 fails to find zlib.dylib on macOS — pin to < 0.7
        run: 'sed -i \'/unordered-containers/i\\\n        -- zlib 0.7.0 fails to find zlib.dylib on macOS\\\n        zlib                        >= 0.6.0    \\&\\& < 0.7 ,\' \\\ndhall.cabal',
        if: 'darwin',
      },
      'cabal v2-update',
      'mkdir -p {{prefix}}/bin',
      'cabal v2-install $ARGS',
      'install -D man/dhall.1 {{prefix}}/share/man/man1/dhall.1',
    ],
    env: {
      ARGS: [
        '--install-method=copy',
        '--installdir={{prefix}}/bin',
        '--jobs={{hw.concurrency}}',
      ],
    },
  },

  test: {
    script: [
      'dhall format <<< \'{ = }\' | grep \'{=}\'',
      'dhall normalize <<< \'let x = 1 in x\' | grep 1',
      'dhall version | grep \'{{version}}\'',
    ],
  },
}
