import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/pueue',
  name: 'pueue',
  programs: [
    'pueue',
    'pueued',
  ],
  // Prebuilt download: pueue ships official per-platform release binaries
  // (bare `pueue-<target>` / `pueued-<target>` files) on github.com/Nukesor/pueue.
  // The asset naming changed at v4.0.0: pre-4.0 used short OS/arch names
  // (e.g. `pueue-linux-x86_64`, `pueue-macos-x86_64`, `pueue-darwin-aarch64`),
  // 4.0.0+ uses Rust target triples (e.g. `pueue-x86_64-unknown-linux-musl`,
  // `pueue-x86_64-apple-darwin`). Linux binaries are static musl builds (run on
  // glibc too). Tags are `v{{version}}`. Install both `pueue` and `pueued`.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'MAJOR=$(echo "$VERSION" | cut -d. -f1)',
      'if [ "$MAJOR" -ge 4 ]; then',
      '  case {{hw.platform}}+{{hw.arch}} in',
      '    darwin+aarch64) TARGET="aarch64-apple-darwin"        ;;',
      '    darwin+x86-64)  TARGET="x86_64-apple-darwin"         ;;',
      '    linux+aarch64)  TARGET="aarch64-unknown-linux-musl"  ;;',
      '    linux+x86-64)   TARGET="x86_64-unknown-linux-musl"   ;;',
      '  esac',
      '  PUEUE="pueue-${TARGET}"',
      '  PUEUED="pueued-${TARGET}"',
      'else',
      '  case {{hw.platform}}+{{hw.arch}} in',
      '    darwin+aarch64) PUEUE="pueue-darwin-aarch64"; PUEUED="pueued-darwin-aarch64" ;;',
      '    darwin+x86-64)  PUEUE="pueue-macos-x86_64";  PUEUED="pueued-macos-x86_64"  ;;',
      '    linux+aarch64)  PUEUE="pueue-linux-aarch64"; PUEUED="pueued-linux-aarch64" ;;',
      '    linux+x86-64)   PUEUE="pueue-linux-x86_64";  PUEUED="pueued-linux-x86_64"  ;;',
      '  esac',
      'fi',
      '',
      'BASE="https://github.com/Nukesor/pueue/releases/download/v${VERSION}"',
      'curl -Lfo pueue "${BASE}/${PUEUE}"',
      'curl -Lfo pueued "${BASE}/${PUEUED}"',
      '',
      'install -Dm755 pueue  {{prefix}}/bin/pueue',
      'install -Dm755 pueued {{prefix}}/bin/pueued',
    ],
  },
  test: {
    script: [
      'pueue --version | grep {{version}}',
      'pueued --version | grep {{version}}',
    ],
  },
}
