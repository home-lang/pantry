import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'solana.com',
  name: 'solana',
  description: 'Web-Scale Blockchain for fast, secure, scalable, decentralized apps and marketplaces.',
  homepage: 'https://solana.com',
  github: 'https://github.com/solana-labs/solana',
  programs: ['solana', 'solana-keygen', 'solana-bench-streamer', 'solana-faucet', 'solana-keygen', 'solana-log-analyzer', 'solana-net-shaper', 'solana-stake-accounts', 'solana-tokens', 'solana-watchtower'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'solana-labs/solana',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'mkdir -p /tmp/solana-extract',
    'SOL_VERSION="{{version}}"',
    'case "{{hw.platform}}/{{hw.arch}}" in',
    '  darwin/aarch64) SOL_ARCH="aarch64-apple-darwin" ;;',
    '  linux/x86-64) SOL_ARCH="x86_64-unknown-linux-gnu" ;;',
    '  *) echo "Unsupported platform" && exit 1 ;;',
    'esac',
    'SOL_URL="https://github.com/anza-xyz/agave/releases/download/v${SOL_VERSION}/solana-release-${SOL_ARCH}.tar.bz2"',
    'curl -fSL "$SOL_URL" -o /tmp/solana-release.tar.bz2',
    'tar -xjf /tmp/solana-release.tar.bz2 -C /tmp/solana-extract',
    'mkdir -p "{{prefix}}/bin"',
    'cp -r /tmp/solana-extract/solana-release/bin/* "{{prefix}}/bin/" 2>/dev/null || true',
    'cp -r /tmp/solana-extract/solana-release/lib "{{prefix}}/" 2>/dev/null || true',
    ],
  },
}
