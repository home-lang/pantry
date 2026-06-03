import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "pandoc.org/crossref",
  name: "crossref",
  programs: [
    "pandoc-crossref",
  ],
  dependencies: {
    'pandoc.org': "^3.8",
    'zlib.net': 1,
    'gnu.org/gmp': 6,
  },
  buildDependencies: {
    'haskell.org': "~9.8.4",
    'haskell.org/cabal': "^3",
    'openssl.org': "^1.1",
    linux: {
      'gnu.org/gcc': 14,
      'gnu.org/binutils': "~2.44",
    },
  },
  distributable: {
    url: "https://hackage.haskell.org/package/pandoc-crossref-{{ version.raw }}/pandoc-crossref-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if ! grep -q 'rpath,{{pkgx.prefix}}' settings; then\n  sed -i \\\n    -e 's|\\(C compiler flags.*\\)\")|\\1 -Wl,-rpath,{{pkgx.prefix}}\")|' \\\n    -e 's|\\(C++ compiler flags.*\\)\")|\\1 -Wl,-rpath,{{pkgx.prefix}}\")|' \\\n    -e 's|\\(C compiler link flags.*\\)\")|\\1 -Wl,-rpath,{{pkgx.prefix}}\")|' \\\n    settings\nfi\n",
        if: "darwin",
        'working-directory': "${{deps.haskell.org.prefix}}/.ghcup/ghc/{{deps.haskell.org.version}}/lib/ghc-{{deps.haskell.org.version}}/lib",
      },
      "cabal update",
      "mkdir -p \"{{prefix}}/bin\"",
      "cabal install --install-method=copy --installdir={{prefix}}/bin",
    ],
  },
  test: {
    script: [
      "true",
    ],
  },
}
