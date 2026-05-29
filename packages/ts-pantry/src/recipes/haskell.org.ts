import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'haskell.org',
  name: 'haskell',
  description: 'The Glasgow Haskell Compiler',
  homepage: 'https://www.haskell.org/ghc/',
  github: 'https://github.com/ghc/ghc',
  programs: ['ghc', 'ghc-{{version.marketing}}', 'ghc-{{version}}', 'ghc-pkg', 'ghc-pkg-{{version.marketing}}', 'ghc-pkg-{{version}}', 'ghci', 'ghci-{{version.marketing}}', 'ghci-{{version}}', 'ghcup', 'haddock', 'haddock-{{version.marketing}}', 'haddock-{{version}}', 'hp2ps', 'hp2ps-{{version.marketing}}', 'hp2ps-{{version}}', 'hpc', 'hpc-{{version.marketing}}', 'hpc-{{version}}', 'hsc2hs', 'hsc2hs-{{version.marketing}}', 'hsc2hs-{{version}}', 'runghc', 'runghc-{{version.marketing}}', 'runghc-{{version}}', 'runhaskell', 'runhaskell-{{version.marketing}}', 'runhaskell-{{version}}'],
  versionSource: {
    type: 'github-tags',
    repo: 'ghc/ghc',
    tagPattern: /^ghc-(.+?)-release$/,
  },
  distributable: null,
  dependencies: {
    'gnu.org/gmp': '6',
    'invisible-island.net/ncurses': '6',
    'sourceware.org/libffi': '3',
    linux: {
      'github.com/numactl/numactl': '^2',
      'gnu.org/gcc': '*',
    },
  },
  buildDependencies: {
    'curl.se': '*',
    linux: {
      'gnu.org/make': '*',
    },
  },

  build: {
    script: [
      // try to force PIC binaries on linux/x86-64
      {
        run: 'install -D $PROP {{prefix}}/.ghcup/config.yaml',
        if: 'linux/x86-64',
        prop: {
          content: [
            'platform-override:',
            '  arch: A_64',
            '  platform:',
            '    contents: Ubuntu',
            '    tag: Linux',
            '  version: \'18.04\'',
            '',
          ].join('\n'),
        },
      },
      'curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh',
      'PATH={{prefix}}/.ghcup/bin:$PATH',
      'ghcup install ghc {{version}}',
      'ghcup set ghc {{version}}',
      {
        run: 'ln -s .ghcup/* .',
        'working-directory': '${{prefix}}',
      },
      {
        run: 'find . -type f -print0 | xargs -0 sed -i -e "s|$PKGX_DIR|\\${PKGX_DIR:-\\$HOME/.pkgx}|g" -e \'s/\\+brewing//g\'',
        'working-directory': '${{prefix}}/ghc/{{version}}/bin',
      },
      {
        run: [
          'sed -i.bak -e "s|$PKGX_DIR|\\${PKGX_DIR:-\\$HOME/.pkgx}|g" env',
          'rm env.bak',
        ].join('\n'),
        'working-directory': '${{prefix}}/.ghcup',
      },
      {
        run: 'find . -type f -name \\*.conf -print0 | xargs -0 sed -i -e \'s|{{prefix}}|${pkgroot}/../../../../..|g\' -e \'s/\\+brewing//g\'',
        'working-directory': '${{prefix}}/ghc/{{version}}/lib/ghc-{{version}}/package.conf.d',
        if: '<9.4',
      },
    ],
    env: {
      BOOTSTRAP_HASKELL_NONINTERACTIVE: '1',
      BOOTSTRAP_HASKELL_NO_UPGRADE: '1',
      BOOTSTRAP_HASKELL_MINIMAL: '1',
      GHCUP_INSTALL_BASE_PREFIX: '${{prefix}}',
      GHCUP_SKIP_UPDATE_CHECK: '1',
    },
  },
}
