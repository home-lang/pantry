import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bat',
  name: 'bat',
  programs: [
    'bat',
  ],
  // Prebuilt download: bat ships official per-platform release tarballs
  // (statically linked, so no runtime zlib/libgit2 needed).
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
      'DIR="bat-v${VERSION}-${TARGET}"',
      'curl -Lfo bat.tar.gz "https://github.com/sharkdp/bat/releases/download/v${VERSION}/${DIR}.tar.gz"',
      'tar xf bat.tar.gz',
      'install -Dm755 "${DIR}/bat" {{prefix}}/bin/bat',
    ],
  },
  test: {
    script: [
      'echo "const x = 1" > test.js',
      'bat --style plain test.js',
    ],
  },
}
