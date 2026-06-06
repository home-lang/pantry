import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/lighthouse',
  name: 'lighthouse',
  programs: [
    'lighthouse',
  ],
  // Prebuilt download: sigp/lighthouse ships official per-platform release
  // tarballs (Rust target triples; bare `lighthouse` binary at the archive
  // root). This replaces a very heavy Rust source build.
  //
  // Asset coverage is NOT uniform across versions:
  //   linux x86_64 (x86_64-unknown-linux-gnu)   — all versions
  //   linux aarch64 (aarch64-unknown-linux-gnu) — all versions
  //   darwin x86_64 (x86_64-apple-darwin)       — < 8.0.0 (dropped at 8.0.0)
  //   darwin aarch64 (aarch64-apple-darwin)     — >= 7.1.0 only
  // For darwin aarch64 before 7.1.0 we fall back to the x86_64-apple-darwin
  // build (runs under Rosetta 2). darwin x86_64 has no native asset at >= 8.0.0,
  // so it falls back to aarch64-apple-darwin only on Apple silicon; a real Intel
  // Mac at >= 8.0.0 has no usable prebuilt and errors out.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'BASE="https://github.com/sigp/lighthouse/releases/download/v${VERSION}"',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu"  ;;',
      '  linux+aarch64)  TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin"       ;;',
      '  *) echo "unsupported platform: {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="${BASE}/lighthouse-v${VERSION}-${TRIPLE}.tar.gz"',
      '# Probe the native asset; some versions lack a native darwin build for an',
      '# arch. On darwin, fall back to whichever apple-darwin build exists',
      '# (Rosetta 2 bridges arch mismatches on Apple silicon).',
      'if ! curl -fsIL -o /dev/null "$URL"; then',
      '  if [ "{{hw.platform}}" = "darwin" ]; then',
      '    for ALT in aarch64-apple-darwin x86_64-apple-darwin; do',
      '      CAND="${BASE}/lighthouse-v${VERSION}-${ALT}.tar.gz"',
      '      if curl -fsIL -o /dev/null "$CAND"; then URL="$CAND"; break; fi',
      '    done',
      '  fi',
      'fi',
      '',
      'curl -Lfo lighthouse.tar.gz "$URL"',
      'tar xzf lighthouse.tar.gz',
      'install -Dm755 lighthouse {{prefix}}/bin/lighthouse',
    ],
  },
  test: {
    script: [
      '{{prefix}}/bin/lighthouse --version',
      '{{prefix}}/bin/lighthouse --version | grep -q "Lighthouse v{{version}}"',
    ],
  },
}
