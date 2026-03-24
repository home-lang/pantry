import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'biomejs.dev',
  name: 'biome',
  description: 'A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP.',
  homepage: 'https://biomejs.dev/',
  github: 'https://github.com/biomejs/biome',
  programs: ['biome'],
  versionSource: {
    type: 'github-releases',
    repo: 'biomejs/biome',
    tagPattern: /\/(cli\/v|@biomejs\/biome@)\//,
  },
  distributable: {
    url: 'https://github.com/biomejs/biome/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      'RUSTFLAGS': '-C strip=symbols',
      'BIOME_VERSION': 'v{{version}}',
    },
  },
}
