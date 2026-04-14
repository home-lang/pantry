import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'soldeer.xyz',
  name: 'soldeer',
  description: 'Solidity Package Manager written in rust and integrated into Foundry (forge soldeer ...)',
  homepage: 'https://soldeer.xyz',
  github: 'https://github.com/mario-eth/soldeer',
  programs: ['soldeer'],
  versionSource: {
    type: 'github-releases',
    repo: 'mario-eth/soldeer',
  },
  distributable: {
    url: 'https://github.com/mario-eth/soldeer/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.74',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path crates/cli --root {{prefix}}',
    ],
  },
}
