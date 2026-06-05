import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sd',
  name: 'sd',
  programs: [
    'sd',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  // Prebuilt download (1.0.0+): sd ships official per-target release tarballs
  // (single `sd` binary at the archive root). It is a vanilla Rust CLI with no
  // custom build configuration. Versions before 1.0.0 predate the prebuilt
  // releases, so they fall back to a source build.
  distributable: {
    url: 'https://github.com/chmln/sd/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // Prebuilt download path for 1.0.0+ (linux gnu/musl, macos universal-less).
      {
        run: [
          'VERSION={{version}}',
          'case {{hw.platform}}+{{hw.arch}} in',
          '  darwin+aarch64) TARGET="aarch64-apple-darwin"        ;;',
          '  darwin+x86-64)  TARGET="x86_64-apple-darwin"         ;;',
          '  linux+aarch64)  TARGET="aarch64-unknown-linux-musl"  ;;',
          '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu"    ;;',
          'esac',
          'DIR="sd-v${VERSION}-${TARGET}"',
          'curl -Lfo sd.tar.gz "https://github.com/chmln/sd/releases/download/v${VERSION}/${DIR}.tar.gz"',
          'tar xf sd.tar.gz',
          'install -Dm755 "${DIR}/sd" {{prefix}}/bin/sd',
        ].join('\n'),
        if: '>=1.0.0',
      },
      // Source-build fallback for pre-1.0.0 (no prebuilt releases exist).
      {
        run: 'sed -i \'s/^version = ".*"/version = "{{version}}"/\' Cargo.toml',
        if: '<1.0.0',
      },
      {
        run: 'cargo install --locked --path . --root {{prefix}}',
        if: '<1.0.0',
      },
    ],
  },
}
