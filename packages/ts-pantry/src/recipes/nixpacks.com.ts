import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nixpacks.com',
  name: 'nixpacks',
  description: 'App source + Nix packages + Docker = Image',
  homepage: 'https://nixpacks.com/',
  github: 'https://github.com/railwayapp/nixpacks',
  programs: ['nixpacks'],
  versionSource: {
    type: 'github-releases',
    repo: 'railwayapp/nixpacks',
  },
  distributable: {
    url: 'git+https://github.com/railwayapp/nixpacks.git',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'sed -i \'s/cargo_toml = "0.13.0"/cargo_toml = "0.14.0"/\' Cargo.toml',
      'cargo install $ARGS',
    ],
    env: {
      'ARGS': ['--root={{prefix}}', '--path=.'],
    },
  },
}
