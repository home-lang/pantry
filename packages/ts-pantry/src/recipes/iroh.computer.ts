import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'iroh.computer',
  name: 'iroh',
  description: 'peer-2-peer that just works',
  homepage: 'https://iroh.computer',
  github: 'https://github.com/n0-computer/iroh',
  programs: ['iroh'],
  versionSource: {
    type: 'github-releases',
    repo: 'n0-computer/iroh',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'case "{{hw.platform}}/{{hw.arch}}" in',
    '  darwin/aarch64) TRIPLE="aarch64-apple-darwin" ;;',
    '  darwin/x86-64) TRIPLE="x86_64-apple-darwin" ;;',
    '  linux/x86-64) TRIPLE="x86_64-unknown-linux-musl" ;;',
    '  linux/aarch64) TRIPLE="aarch64-unknown-linux-musl" ;;',
    '  *) echo "Unsupported platform" && exit 1 ;;',
    'esac',
    'mkdir -p "{{prefix}}/bin" /tmp/iroh-extract',
    'for TOOL in iroh-relay iroh-dns-server; do',
    '  curl -fSL -o /tmp/${TOOL}.tar.gz "https://github.com/n0-computer/iroh/releases/download/v{{version}}/${TOOL}-v{{version}}-${TRIPLE}.tar.gz"',
    '  tar -xzf /tmp/${TOOL}.tar.gz -C /tmp/iroh-extract',
    '  cp /tmp/iroh-extract/${TOOL} "{{prefix}}/bin/" 2>/dev/null || cp /tmp/iroh-extract/*/${TOOL} "{{prefix}}/bin/" 2>/dev/null || true',
    '  chmod +x "{{prefix}}/bin/${TOOL}"',
    'done',
    'ln -s iroh-relay "{{prefix}}/bin/iroh"',
    ],
  },
}
