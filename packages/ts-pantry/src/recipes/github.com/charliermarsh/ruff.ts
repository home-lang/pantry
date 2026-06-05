import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/charliermarsh/ruff',
  name: 'ruff',
  programs: [
    'ruff',
  ],
  // charliermarsh/ruff is the old org name for astral-sh/ruff — same releases.
  // Prebuilt download: ruff (Rust) ships official per-platform release tarballs
  // on github.com/astral-sh/ruff. The asset naming has three eras handled below.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin"       ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu"  ;;',
      'esac',
      '',
      '# ruff release asset naming has three eras:',
      '#   < 0.1.8          tag "v<v>", asset "ruff-<target>.tar.gz" (no version in name)',
      '#   >= 0.1.8 < 0.5.0 tag "v<v>", asset "ruff-<v>-<target>.tar.gz"',
      '#   >= 0.5.0         tag "<v>" (no v prefix), asset "ruff-<target>.tar.gz"',
      'older() { test "$(printf "%s\\n%s\\n" "$1" "$VERSION" | sort -V | head -1)" = "$VERSION" && test "$VERSION" != "$1"; }',
      'if older 0.5.0; then',
      '  TAG="v${VERSION}"',
      '  if older 0.1.8; then',
      '    ASSET="ruff-${TARGET}"',
      '  else',
      '    ASSET="ruff-${VERSION}-${TARGET}"',
      '  fi',
      'else',
      '  TAG="${VERSION}"',
      '  ASSET="ruff-${TARGET}"',
      'fi',
      '',
      'curl -Lfo ruff.tar.gz "https://github.com/astral-sh/ruff/releases/download/${TAG}/${ASSET}.tar.gz"',
      'tar xf ruff.tar.gz',
      '',
      '# Binary is either at top-level (older eras) or inside ruff-<target>/ (>=0.5.0).',
      'BIN=$(find . -name ruff -type f -perm -u+x | head -1)',
      'install -Dm755 "$BIN" {{prefix}}/bin/ruff',
    ],
  },
  test: {
    script: [
      'ruff --version',
    ],
  },
}
