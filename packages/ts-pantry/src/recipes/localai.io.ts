import type { Recipe } from '../../scripts/recipe-types'

// DOWNLOAD recipe: upstream ships clean per-platform `local-ai` binaries on every
// release (local-ai-v<ver>-linux-amd64 / -linux-arm64 / -darwin-arm64), so we
// download the official prebuilt instead of doing the very heavy Go+CGO/C++ source
// build (gRPC via cmake, llama.cpp backends) that fails in CI. Download-first.
export const recipe: Recipe = {
  domain: 'localai.io',
  name: 'LocalAI',
  description: 'The free, Open Source alternative to OpenAI, Claude and others. Self-hosted and local-first.',
  homepage: 'https://localai.io',
  github: 'https://github.com/mudler/LocalAI',
  // Only the platforms upstream ships a standalone binary for (darwin-x86-64
  // ships only a .dmg GUI bundle, not a CLI binary).
  platforms: [
    'linux/x86-64',
    'linux/aarch64',
    'darwin/aarch64',
  ],
  programs: ['local-ai'],
  versionSource: {
    type: 'github-releases',
    repo: 'mudler/LocalAI',
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  linux+x86-64)   ASSET="linux-amd64"  ;;',
      '  linux+aarch64)  ASSET="linux-arm64"  ;;',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  *) echo "unsupported platform {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'URL="https://github.com/mudler/LocalAI/releases/download/v${VERSION}/local-ai-v${VERSION}-${ASSET}"',
      'curl -Lfo local-ai "$URL"',
      'install -Dm755 local-ai {{prefix}}/bin/local-ai',
    ],
  },
  test: {
    script: ['{{prefix}}/bin/local-ai --help'],
  },
}
