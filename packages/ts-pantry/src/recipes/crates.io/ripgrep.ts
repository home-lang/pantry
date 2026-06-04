import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/ripgrep',
  name: 'ripgrep',
  programs: [
    'rg',
  ],
  // Prebuilt download: ripgrep ships official per-platform release tarballs.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin"       ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-musl" ;;',
      'esac',
      '',
      'DIR="ripgrep-${VERSION}-${TARGET}"',
      'curl -Lfo rg.tar.gz "https://github.com/BurntSushi/ripgrep/releases/download/${VERSION}/${DIR}.tar.gz"',
      'tar xf rg.tar.gz',
      'install -Dm755 "${DIR}/rg" {{prefix}}/bin/rg',
    ],
  },
  test: {
    script: [
      'echo hello > test.txt',
      'rg hello test.txt',
    ],
  },
}
