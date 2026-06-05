import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'digger.dev',
  name: 'digger',
  description: 'Digger is an open source IaC orchestration tool. Digger allows you to run IaC in your existing CI pipeline ⚡️  ',
  homepage: 'https://digger.dev',
  github: 'https://github.com/diggerhq/digger',
  programs: ['digger'],
  versionSource: {
    type: 'github-releases',
    repo: 'diggerhq/digger',
  },
  // Download the official prebuilt `digger-cli` binary instead of building from
  // source. Upstream ships a per-platform single binary for every 0.6.x release
  // (github.com/diggerhq/digger releases: digger-cli-<os>-<arch>), which matches
  // exactly what we'd produce — and the source build is brittle (vendored dep
  // patches, missing modules per version).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="darwin-arm64" ;;',
      '  darwin+x86-64)  TARGET="darwin-amd64" ;;',
      '  linux+aarch64)  TARGET="linux-arm64"  ;;',
      '  linux+x86-64)   TARGET="linux-amd64"  ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/diggerhq/digger/releases/download/v${VERSION}/digger-cli-${TARGET}"',
      'curl -Lfo digger "$URL"',
      'install -Dm755 digger {{prefix}}/bin/digger',
    ],
  },
  test: {
    script: [
      'digger --help',
    ],
  },
}
