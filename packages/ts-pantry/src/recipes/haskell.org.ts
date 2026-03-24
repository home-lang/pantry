import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'haskell.org',
  name: 'haskell',
  description: 'Mirror of the Glasgow Haskell Compiler. Please submit issues and patches to GHC\\',
  homepage: 'http://www.haskell.org/ghc/',
  github: 'https://github.com/ghc/ghc',
  programs: ['ghc', 'ghc-{{version.marketing}}', 'ghc-{{version}}', 'ghc-pkg', 'ghc-pkg-{{version.marketing}}', 'ghc-pkg-{{version}}', 'ghci', 'ghci-{{version.marketing}}', 'ghci-{{version}}', 'ghcup', 'haddock', 'haddock-{{version.marketing}}', 'haddock-{{version}}', 'hp2ps', 'hp2ps-{{version.marketing}}', 'hp2ps-{{version}}', 'hpc', 'hpc-{{version.marketing}}', 'hpc-{{version}}', 'hsc2hs', 'hsc2hs-{{version.marketing}}', 'hsc2hs-{{version}}', 'runghc', 'runghc-{{version.marketing}}', 'runghc-{{version}}', 'runhaskell', 'runhaskell-{{version.marketing}}', 'runhaskell-{{version}}'],
  versionSource: {
    type: 'github-releases',
    repo: 'ghc/ghc/tags',
    tagPattern: /\/^ghc-\/,\/-release$\//,
  },
  distributable: null,
  dependencies: {
    'gnu.org/gmp': '6',
    'invisible-island.net/ncurses': '6',
    'sourceware.org/libffi': '3',
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh',
      'PATH={{prefix}}/.ghcup/bin:$PATH',
      'ghcup install ghc {{version}}',
      'ghcup set ghc {{version}}',
      'cd "${{prefix}}/ghc/{{version}}/lib/ghc-{{version}}/package.conf.d"',
      'find . -type f -name \\*.conf -print0 | xargs -0 sed -i -e \'s|{{prefix}}|${pkgroot}/../../../../..|g\' -e \'s/\\+brewing//g\'',
      'mkdir -p "{{prefix}}/bin"',
      'for f in "{{prefix}}/.ghcup/bin/"*; do [ -f "$f" ] && ln -sf "$f" "{{prefix}}/bin/$(basename "$f")" 2>/dev/null || true; done',
      'for f in "{{prefix}}/.ghcup/ghc/{{version}}/bin/"*; do [ -f "$f" ] && ln -sf "$f" "{{prefix}}/bin/$(basename "$f")" 2>/dev/null || true; done',
    ],
    env: {
      'BOOTSTRAP_HASKELL_NONINTERACTIVE': '1',
      'BOOTSTRAP_HASKELL_NO_UPGRADE': '1',
      'BOOTSTRAP_HASKELL_MINIMAL': '1',
      'GHCUP_INSTALL_BASE_PREFIX': '${{prefix}}',
      'GHCUP_SKIP_UPDATE_CHECK': '1',
    },
  },
}
