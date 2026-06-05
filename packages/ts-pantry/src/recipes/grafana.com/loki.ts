import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'grafana.com/loki',
  name: 'loki',
  programs: [
    'loki',
  ],
  // Download official prebuilt binaries instead of compiling from source.
  // Grafana ships per-version, multi-platform release zips for loki.
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="linux-arm64" ;;',
      '  linux+x86-64)   ASSET="linux-amd64" ;;',
      'esac',
      'URL="https://github.com/grafana/loki/releases/download/v${VERSION}/loki-${ASSET}.zip"',
      'curl -Lfo loki.zip "$URL"',
      'unzip -o loki.zip',
      'install -Dm755 "loki-${ASSET}" {{prefix}}/bin/loki',
      'curl -Lfo loki-local-config.yaml "https://raw.githubusercontent.com/grafana/loki/v${VERSION}/cmd/loki/loki-local-config.yaml"',
      'install -Dm644 loki-local-config.yaml {{prefix}}/etc/loki-local-config.yaml',
    ],
  },
  test: {
    script: [
      'loki --version | tee out',
      'grep {{version}} out',
    ],
  },
}
