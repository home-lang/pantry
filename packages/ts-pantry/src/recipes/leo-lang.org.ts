import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leo-lang.org',
  name: 'leo',
  description: '🦁 The Leo Programming Language. A Programming Language for Formally Verified, Zero-Knowledge Applications',
  homepage: 'https://leo-lang.org/',
  github: 'https://github.com/ProvableHQ/leo',
  programs: ['leo'],
  // Prebuilt download: ProvableHQ ships official per-platform zips on every
  // `v<ver>` release (each contains a single binary named `leo`). Upstream's
  // asset *prefix* changed across releases (leo-v<ver> / leo-mainnet /
  // leo-330 / leo-331 / leo-release-3.5) so we map version -> prefix below.
  // Triples: aarch64-apple-darwin, x86_64-apple-darwin, x86_64-unknown-linux-gnu.
  // NOTE: upstream ships NO linux/aarch64 binary — that platform is gated out.
  distributable: null,
  versionSource: {
    type: 'github-releases',
    repo: 'ProvableHQ/leo',
    tagPattern: /^v(.+)$/,
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin" ;;',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  *) echo "leo: no prebuilt binary for {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      '# upstream asset prefix is not stable across releases',
      'case "$VERSION" in',
      '  3.5.0) PREFIX="leo-release-3.5" ;;',
      '  3.3.1) PREFIX="leo-331" ;;',
      '  3.3.0) PREFIX="leo-330" ;;',
      '  2.4.0|2.4.1|2.5.0|2.6.0|2.6.1|2.7.0|2.7.1|2.7.2|2.7.3|3.0.0|3.1.0|3.2.0) PREFIX="leo-mainnet" ;;',
      '  *) PREFIX="leo-v${VERSION}" ;;',
      'esac',
      '',
      'URL="https://github.com/ProvableHQ/leo/releases/download/v${VERSION}/${PREFIX}-${TRIPLE}.zip"',
      'curl -Lfo leo.zip "$URL"',
      'unzip -q leo.zip',
      '',
      'install -Dm755 leo {{prefix}}/bin/leo',
    ],
  },
  test: {
    script: [
      'leo --version',
    ],
  },
}
