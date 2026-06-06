import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dhall-lang.org',
  name: 'dhall',
  description: 'Interpreter for the Dhall language',
  homepage: 'https://dhall-lang.org/',
  github: 'https://github.com/dhall-lang/dhall-haskell',
  programs: ['dhall'],
  versionSource: {
    type: 'github-releases',
    repo: 'dhall-lang/dhall-haskell',
  },
  // Prebuilt download: the Haskell `dhall` interpreter is slow and brittle to
  // compile (GHC + cabal). Upstream ships official statically-prepared release
  // tarballs (`dhall-<ver>-<arch>-<os>.tar.bz2`) containing `bin/dhall` and the
  // man page — identical to what we'd produce, with no custom build options.
  // Upstream ships darwin (aarch64 + x86-64) and linux (x86-64 only); there is
  // no linux-aarch64 prebuilt, so that platform is gated out.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="aarch64-darwin" ;;',
      '  darwin+x86-64)  ASSET="x86_64-darwin"  ;;',
      '  linux+x86-64)   ASSET="x86_64-linux"   ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}} (no upstream prebuilt)" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo dhall.tar.bz2 "https://github.com/dhall-lang/dhall-haskell/releases/download/${VERSION}/dhall-${VERSION}-${ASSET}.tar.bz2"',
      'mkdir -p {{prefix}}',
      'tar xjf dhall.tar.bz2 -C {{prefix}}',
      'chmod 755 {{prefix}}/bin/dhall',
    ],
  },

  test: {
    script: [
      'dhall format <<< \'{ = }\' | grep \'{=}\'',
      'dhall normalize <<< \'let x = 1 in x\' | grep 1',
      'dhall version | grep \'{{version}}\'',
    ],
  },
}
