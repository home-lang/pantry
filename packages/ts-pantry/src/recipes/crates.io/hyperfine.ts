import type { Recipe } from '../../../scripts/recipe-types'

// hyperfine ships official prebuilt release binaries for every platform we target.
// Each release publishes `hyperfine-v<version>-<target>.tar.gz` containing the
// `hyperfine` binary (plus man page and shell completions). Download the official
// asset instead of compiling from source via cargo.
export const recipe: Recipe = {
  domain: 'crates.io/hyperfine',
  name: 'hyperfine',
  programs: [
    'hyperfine',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'sharkdp/hyperfine',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu" ;;',
      'esac',
      '',
      'DIR="hyperfine-v${VERSION}-${TARGET}"',
      'URL="https://github.com/sharkdp/hyperfine/releases/download/v${VERSION}/${DIR}.tar.gz"',
      'curl -Lfo hyperfine.tar.gz "$URL"',
      'tar xzf hyperfine.tar.gz',
      'install -Dm755 "${DIR}/hyperfine" {{prefix}}/bin/hyperfine',
      'if test -f "${DIR}/hyperfine.1"; then',
      '  install -Dm644 "${DIR}/hyperfine.1" {{prefix}}/share/man/man1/hyperfine.1',
      'fi',
    ],
  },
  test: {
    script: [
      'hyperfine --version',
      'hyperfine --version | grep {{version}}',
    ],
  },
}
