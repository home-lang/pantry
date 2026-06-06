import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openai.com/codex',
  name: 'codex',
  programs: [
    'codex',
  ],
  // Prebuilt download: openai ships official per-platform `codex-<triple>.tar.gz`
  // CLI archives on every `rust-v<ver>` release (each archive contains a single
  // binary named after the triple, which we rename to `codex`). Verified for the
  // full stored version range (0.36.0 -> 0.116.0). The other historical programs
  // (codex-exec/codex-tui/md-events) were sub-binaries of the source build; the
  // prebuilt `codex` is a unified CLI exposing `codex exec`/`codex tui`.
  distributable: null,
  versionSource: {
    type: 'github-releases',
    repo: 'openai/codex',
    tagPattern: /^rust-v(.+)$/,
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  *) echo "codex: no prebuilt binary for {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/openai/codex/releases/download/rust-v${VERSION}/codex-${TRIPLE}.tar.gz"',
      'curl -Lfo codex.tar.gz "$URL"',
      'tar xzf codex.tar.gz',
      '',
      '# the archive ships a single binary named after the triple; install as `codex`',
      'install -Dm755 "codex-${TRIPLE}" {{prefix}}/bin/codex',
    ],
  },
  test: {
    script: [
      'codex --version',
      'test "$(codex --version)" = "codex-cli {{version}}"',
    ],
  },
}
