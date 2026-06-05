import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitu',
  name: 'gitu',
  programs: [
    'gitu',
  ],
  dependencies: {
    'zlib.net': '~1.3',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    // Only needed for the source-build fallback (linux/aarch64 has no
    // official prebuilt binary).
    'linux/aarch64': {
      'rust-lang.org': '>=1.56',
      'rust-lang.org/cargo': '*',
    },
  },
  // Download official prebuilt binaries where upstream ships them
  // (linux x86-64, macOS); fall back to a source build for linux/aarch64.
  distributable: {
    url: 'https://github.com/altsem/gitu/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin" ;;',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  *) TRIPLE="" ;;',
      'esac',
      'if [ -n "$TRIPLE" ]; then',
      '  DIR="gitu-v{{version}}-${TRIPLE}"',
      '  URL="https://github.com/altsem/gitu/releases/download/v{{version}}/${DIR}.zip"',
      '  curl -Lfo gitu.zip "$URL"',
      '  unzip -o gitu.zip',
      '  install -Dm755 "${DIR}/gitu" {{prefix}}/bin/gitu',
      'else',
      '  sed -i \'s/git_version::git_version!(cargo_suffix = "")/{{version}}/\' src/main.rs',
      '  cargo install --locked --path . --root {{prefix}}',
      'fi',
    ],
  },
  test: {
    script: [
      'test "$(gitu --version)" = "gitu {{version}}"',
      'gitu --help',
    ],
  },
}
