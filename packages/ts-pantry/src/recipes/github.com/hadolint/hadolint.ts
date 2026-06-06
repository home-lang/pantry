import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/hadolint/hadolint',
  name: 'hadolint',
  programs: [
    'hadolint',
  ],
  distributable: null,
  build: {
    script: [
      'VERSION={{version.tag}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="hadolint-macos-arm64" ;;',
      '  darwin+x86-64)  ASSET="hadolint-macos-x86_64" ;;',
      '  linux+aarch64)  ASSET="hadolint-linux-arm64" ;;',
      '  linux+x86-64)   ASSET="hadolint-linux-x86_64" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo hadolint "https://github.com/hadolint/hadolint/releases/download/${VERSION}/${ASSET}"',
      'install -Dm755 hadolint {{prefix}}/bin/hadolint',
    ],
  },
  test: {
    script: [
      'hadolint --version | grep {{version}}',
      'printf "FROM ubuntu\\nRUN apt-get update\\n" > Dockerfile',
      'hadolint Dockerfile 2>&1 | tee out || true',
      'grep DL3006 out',
    ],
  },
}
