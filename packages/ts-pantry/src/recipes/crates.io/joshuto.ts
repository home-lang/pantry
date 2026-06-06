import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/joshuto',
  name: 'joshuto',
  programs: [
    'joshuto',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'kamiyaa/joshuto',
    // joshuto tags every release as a GitHub "pre-release", so include them.
    stable: false,
  },
  // Prebuilt download: joshuto (Rust) ships official per-platform release
  // tarballs (`joshuto-v<ver>-<target>.tar.gz`) with a single flat `joshuto`
  // binary. Vanilla Rust CLI with no build-time customization, so the official
  // prebuilt is identical to a source build.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin"       ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin"        ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu"  ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu"   ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo joshuto.tar.gz "https://github.com/kamiyaa/joshuto/releases/download/v${VERSION}/joshuto-v${VERSION}-${TARGET}.tar.gz"',
      'tar xzf joshuto.tar.gz',
      'install -Dm755 "joshuto-v${VERSION}-${TARGET}/joshuto" {{prefix}}/bin/joshuto',
    ],
  },

  test: {
    script: [
      'joshuto version | grep {{version}}',
    ],
  },
}
