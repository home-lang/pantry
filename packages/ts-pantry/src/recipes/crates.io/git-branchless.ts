import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-branchless',
  name: 'git-branchless',
  programs: [
    'git-branchless',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'arxanas/git-branchless',
  },
  // Prebuilt download: git-branchless (Rust) ships official per-platform release
  // tarballs (`git-branchless-v<ver>-<target>.tar.gz`) with a single flat
  // `git-branchless` binary. Vanilla Rust CLI, no build-time customization.
  // Upstream ships darwin (aarch64 only) and linux musl (aarch64 + x86-64);
  // there is no x86-64 darwin prebuilt, so that platform is gated out.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin"        ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-musl"  ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-musl"   ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}} (no upstream prebuilt)" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo git-branchless.tar.gz "https://github.com/arxanas/git-branchless/releases/download/v${VERSION}/git-branchless-v${VERSION}-${TARGET}.tar.gz"',
      'tar xzf git-branchless.tar.gz',
      'install -Dm755 git-branchless {{prefix}}/bin/git-branchless',
    ],
  },

  test: {
    script: [
      'test "$(git-branchless --version)" = "git-branchless-opts {{version}}"',
    ],
  },
}
