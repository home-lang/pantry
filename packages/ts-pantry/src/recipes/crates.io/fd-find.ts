import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/fd-find',
  name: 'fd-find',
  programs: [
    'fd',
  ],
  // Prebuilt download: fd ships official per-platform release tarballs.
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
      'DIR="fd-v${VERSION}-${TARGET}"',
      'curl -Lfo fd.tar.gz "https://github.com/sharkdp/fd/releases/download/v${VERSION}/${DIR}.tar.gz"',
      'tar xf fd.tar.gz',
      'install -Dm755 "${DIR}/fd" {{prefix}}/bin/fd',
    ],
  },
  test: {
    script: [
      'touch test.cpp',
      'fd -e cpp test',
    ],
  },
}
