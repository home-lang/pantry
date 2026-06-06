import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/wasm-pack',
  name: 'wasm-pack',
  programs: [
    'wasm-pack',
  ],
  dependencies: {
    'rust-lang.org': '*',
    'rust-lang.org/cargo': '*',
  },
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: null,
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'VERSION={{version.raw}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-musl" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-musl" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo wasm-pack.tar.gz "https://github.com/rustwasm/wasm-pack/releases/download/v${VERSION}/wasm-pack-v${VERSION}-${TARGET}.tar.gz"',
      'tar xzf wasm-pack.tar.gz',
      'install -Dm755 "wasm-pack-v${VERSION}-${TARGET}/wasm-pack" {{prefix}}/bin/wasm-pack',
    ],
  },
  test: {
    script: [
      'test "$({{prefix}}/bin/wasm-pack --version)" = "wasm-pack {{version.raw}}"',
    ],
  },
}
