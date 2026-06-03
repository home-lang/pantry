import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'haskell.org/cabal',
  name: 'cabal',
  description: 'Official upstream development repository for Cabal and cabal-install',
  homepage: 'https://www.haskell.org/cabal/',
  github: 'https://github.com/haskell/cabal',
  programs: ['cabal'],
  dependencies: {
    'haskell.org': '9',
    'gnu.org/gmp': '6',
    'zlib.net': '1',
  },
  buildDependencies: {
    'haskell.org': '<9.6.4', // later versions pass invalid linker flags on darwin clang-14
    'curl.se': '*',
    'tukaani.org/xz': '5',
    'linux/aarch64': {
      'github.com/numactl/numactl': '^2', // downloaded cabal needs this
    },
  },
  versionSource: {
    type: 'github-releases',
    repo: 'haskell/cabal',
    // tags look like `cabal-install-v3.12.1.0` or `Cabal-v3.10.3.0`
    tagPattern: /^[Cc]abal(?:-install)?-v(.+)$/,
  },
  distributable: {
    url: 'https://hackage.haskell.org/packages/archive/cabal-install/{{version.raw}}/cabal-install-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // utf-8 issues
      {
        run: 'export HOME="$(mktemp -d)"',
        if: 'linux',
      },
      // FIXME: this isn't great, but it'll fix any ghc install at build time
      // needs install-time customization for a true fix
      {
        run: [
          'if ! grep -q \'rpath,{{pkgx.prefix}}\' settings; then',
          '  sed -i \\',
          '    -e \'s|\\(C compiler flags.*\\)")|\\1 -Wl,-rpath,{{pkgx.prefix}}")|\' \\',
          '    -e \'s|\\(C++ compiler flags.*\\)")|\\1 -Wl,-rpath,{{pkgx.prefix}}")|\' \\',
          '    -e \'s|\\(C compiler link flags.*\\)")|\\1 -Wl,-rpath,{{pkgx.prefix}}")|\' \\',
          '    settings',
          'fi',
        ].join('\n'),
        if: 'darwin',
        'working-directory': '${{deps.haskell.org.prefix}}/.ghcup/ghc/{{deps.haskell.org.version}}/lib/ghc-{{deps.haskell.org.version}}/lib',
      },
      {
        run: [
          'if test ! -e .bootstrap/cabal; then',
          '  if test ! -e .bootstrap; then',
          '    mkdir .bootstrap',
          '  fi',
          '  curl -L "${BOOTSTRAP}" | tar Jxf - -C .bootstrap',
          'fi',
        ].join('\n'),
      },
      // This seems dirty, but building is an internal-only gig atm.
      {
        run: [
          'if test -e ~/.cabal/bin; then',
          '  rm -r ~/.cabal/bin',
          'fi',
        ].join('\n'),
      },
      // zlib 0.7.0.0 doesn't respect our rpaths with its intermediate build products
      // SEE https://github.com/haskell/cabal/issues/8118
      'sed -i -e \'s/build-depends: base.*/build-depends: base >=4.10 \\&\\& <5/\' cabal-install.cabal',
      'mkdir -p {{prefix}}/bin',
      './.bootstrap/cabal v2-update',
      './.bootstrap/cabal v2-install --install-method=copy --installdir={{prefix}}/bin $ADDITIONAL_CABAL_FLAGS',
    ],
    skip: ['fix-patchelf'],
    env: {
      'darwin/aarch64': {
        BOOTSTRAP: 'https://downloads.haskell.org/~cabal/cabal-install-3.10.2.0/cabal-install-3.10.2.0-aarch64-darwin.tar.xz',
      },
      'darwin/x86-64': {
        BOOTSTRAP: 'https://downloads.haskell.org/~cabal/cabal-install-3.10.2.0/cabal-install-3.10.2.0-x86_64-darwin.tar.xz',
      },
      'linux/x86-64': {
        BOOTSTRAP: 'https://downloads.haskell.org/~cabal/cabal-install-3.10.2.0/cabal-install-3.10.2.0-x86_64-linux-deb10.tar.xz',
      },
      'linux/aarch64': {
        BOOTSTRAP: 'https://downloads.haskell.org/~cabal/cabal-install-3.10.2.0/cabal-install-3.10.2.0-aarch64-linux-deb10.tar.xz',
      },
      linux: {
        ADDITIONAL_CABAL_FLAGS: [
          '-v3',
          // else segfaults
          '--enable-relocatable',
          '--ghc-option=-fPIC',
          '--ghc-option=-optl=-pie',
        ],
      },
    },
  },

  test: {
    script: [
      'cabal --config-file=./config user-config init',
      'cabal --config-file=./config update',
      'cabal --config-file=./config info Cabal',
    ],
  },
}
