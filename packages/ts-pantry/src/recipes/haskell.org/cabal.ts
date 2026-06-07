import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'haskell.org/cabal',
  name: 'cabal',
  description: 'Official upstream development repository for Cabal and cabal-install',
  homepage: 'https://www.haskell.org/cabal/',
  github: 'https://github.com/haskell/cabal',
  programs: ['cabal'],
  dependencies: {
    'gnu.org/gmp': '6',
    'zlib.net': '1',
  },
  versionSource: {
    type: 'github-releases',
    repo: 'haskell/cabal',
    // tags look like `cabal-install-v3.12.1.0` or `Cabal-v3.10.3.0`
    tagPattern: /^[Cc]abal(?:-install)?-v(.+)$/,
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=cabal-install-{{version}}-aarch64-darwin.tar.xz ;;',
      '  darwin+x86-64) ASSET=cabal-install-{{version}}-x86_64-darwin.tar.xz ;;',
      '  linux+x86-64) ASSET=cabal-install-{{version}}-x86_64-linux-deb10.tar.xz ;;',
      '  linux+aarch64) ASSET=cabal-install-{{version}}-aarch64-linux-deb10.tar.xz ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl --fail --location --retry 3 --retry-delay 2 --connect-timeout 15 --max-time 600 -o "$ASSET" "https://downloads.haskell.org/~cabal/cabal-install-{{version}}/$ASSET"',
      'mkdir extract {{prefix}}/bin',
      'tar -xJf "$ASSET" -C extract',
      'install -m755 extract/cabal {{prefix}}/bin/cabal',
    ],
  },

  test: {
    script: [
      'test "$(cabal --numeric-version)" = "{{version}}"',
    ],
  },
}
