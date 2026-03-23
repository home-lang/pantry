import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'spacetimedb.com',
  name: 'spacetime',
  description: 'Multiplayer at the speed of light',
  homepage: 'https://spacetimedb.com',
  github: 'https://github.com/clockworklabs/SpacetimeDB',
  programs: ['spacetime'],
  versionSource: {
    type: 'github-releases',
    repo: 'clockworklabs/SpacetimeDB',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'case "{{hw.platform}}/{{hw.arch}}" in',
      '  darwin/aarch64) TRIPLE="aarch64-apple-darwin" ;;',
      '  darwin/x86-64) TRIPLE="x86_64-apple-darwin" ;;',
      '  linux/x86-64) TRIPLE="x86_64-unknown-linux-gnu" ;;',
      '  linux/aarch64) TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  *) echo "Unsupported platform" && exit 1 ;;',
      'esac',
      'curl -fSL -o /tmp/spacetime.tar.gz "https://github.com/clockworklabs/SpacetimeDB/releases/download/v{{version}}/spacetime-${TRIPLE}.tar.gz"',
      'mkdir -p /tmp/spacetime-extract "{{prefix}}/bin"',
      'tar -xzf /tmp/spacetime.tar.gz -C /tmp/spacetime-extract',
      'find /tmp/spacetime-extract -name spacetime -type f | head -1 | xargs -I{} cp {} "{{prefix}}/bin/spacetime"',
      'chmod +x "{{prefix}}/bin/spacetime"',
    ],
  },
}
