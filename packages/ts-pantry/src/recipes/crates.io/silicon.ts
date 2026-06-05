import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/silicon',
  name: 'silicon',
  programs: [
    'silicon',
  ],
  dependencies: {
    'harfbuzz.org': '^5',
    linux: {
      'freedesktop.org/fontconfig': '*',
      'freetype.org': '*',
      'x.org/xcb': '*',
    },
  },
  buildDependencies: {
    // Only needed for the source-build fallback (arm64 has no official
    // prebuilt binary).
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
  },
  // Download official prebuilt binaries where upstream ships them
  // (linux x86-64, macOS x86-64); fall back to a source build otherwise.
  distributable: {
    url: 'https://github.com/Aloxaf/silicon/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64) TRIPLE="x86_64-apple-darwin" ;;',
      '  linux+x86-64)  TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  *) TRIPLE="" ;;',
      'esac',
      'if [ -n "$TRIPLE" ]; then',
      '  URL="https://github.com/Aloxaf/silicon/releases/download/v{{version}}/silicon-v{{version}}-${TRIPLE}.tar.gz"',
      '  curl -Lfo silicon.tar.gz "$URL"',
      '  tar xzf silicon.tar.gz',
      '  install -Dm755 silicon {{prefix}}/bin/silicon',
      'else',
      '  sed -i \'1,20s/^version = .*/version = {{ version }}/\' Cargo.toml',
      '  cargo install --locked --path . --root {{prefix}}',
      'fi',
    ],
  },
}
