import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sccache',
  name: 'sccache',
  programs: [
    'sccache',
  ],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: null,
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-musl" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-musl" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo sccache.tar.gz "https://github.com/mozilla/sccache/releases/download/v${VERSION}/sccache-v${VERSION}-${TARGET}.tar.gz"',
      'tar xzf sccache.tar.gz',
      'install -Dm755 "sccache-v${VERSION}-${TARGET}/sccache" {{prefix}}/bin/sccache',
    ],
  },
  test: {
    script: [
      'test "$({{prefix}}/bin/sccache --version)" = "sccache {{version}}"',
    ],
  },
}
