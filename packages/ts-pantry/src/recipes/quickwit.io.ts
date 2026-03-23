import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'quickwit.io',
  name: 'quickwit',
  description: 'Cloud-native search engine for observability. An open-source alternative to Datadog, Elasticsearch, Loki, and Tempo.',
  homepage: 'https://quickwit.io',
  github: 'https://github.com/quickwit-oss/quickwit',
  programs: ['quickwit'],
  versionSource: {
    type: 'github-releases',
    repo: 'quickwit-oss/quickwit',
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
    'curl -fSL -o /tmp/quickwit.tar.gz "https://github.com/quickwit-oss/quickwit/releases/download/v{{version}}/quickwit-v{{version}}-${TRIPLE}.tar.gz"',
    'mkdir -p /tmp/quickwit-extract "{{prefix}}/bin"',
    'tar -xzf /tmp/quickwit.tar.gz -C /tmp/quickwit-extract',
    'find /tmp/quickwit-extract -name quickwit -type f | head -1 | xargs -I{} cp {} "{{prefix}}/bin/quickwit"',
    'chmod +x "{{prefix}}/bin/quickwit"',
    ],
  },
}
