import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'taplo.tamasfe.dev',
  name: 'taplo',
  description: 'A TOML toolkit written in Rust',
  homepage: 'https://taplo.tamasfe.dev',
  github: 'https://github.com/tamasfe/taplo',
  programs: ['taplo'],
  versionSource: {
    type: 'github-releases',
    repo: 'tamasfe/taplo',
  },
  distributable: {
    url: 'https://github.com/tamasfe/taplo/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path crates/taplo-cli --root {{prefix}}',
    ],
  },
}
