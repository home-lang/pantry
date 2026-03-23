import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'getfoundry.sh',
  name: 'getfoundry.sh',
  description: 'Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.',
  homepage: 'https://getfoundry.sh',
  github: 'https://github.com/foundry-rs/foundry',
  programs: ['forge', 'anvil', 'cast', 'chisel'],
  versionSource: {
    type: 'github-releases',
    repo: 'foundry-rs/foundry',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'OS=$(uname -s | tr "[:upper:]" "[:lower:]")',
    'ARCH=$(uname -m)',
    'case "$ARCH" in',
    '  arm64|aarch64) ARCH="arm64" ;;',
    '  x86_64) ARCH="amd64" ;;',
    'esac',
    'mkdir -p "{{prefix}}/bin"',
    'curl -fSL "https://github.com/foundry-rs/foundry/releases/download/v{{version}}/foundry_v{{version}}_${OS}_${ARCH}.tar.gz" | tar xz -C "{{prefix}}/bin"',
    'chmod +x "{{prefix}}/bin/forge" "{{prefix}}/bin/cast" "{{prefix}}/bin/anvil" "{{prefix}}/bin/chisel"',
    ],
  },
}
