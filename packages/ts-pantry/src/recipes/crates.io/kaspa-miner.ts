import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/kaspa-miner',
  name: 'kaspa-miner',
  programs: [
    'kaspa-miner',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'protobuf.dev': '25',
  },
  versionSource: {
    type: 'github-releases',
    repo: 'elichai/kaspa-miner',
    tagPattern: /^v(.+)$/,
    stable: true,
  },
  distributable: {
    url: 'https://github.com/elichai/kaspa-miner/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
