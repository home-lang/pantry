import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'prefix.dev',
  name: 'pixi',
  description: 'Package management made easy',
  homepage: 'https://pixi.sh',
  github: 'https://github.com/prefix-dev/pixi',
  programs: ['pixi'],
  versionSource: {
    type: 'github-releases',
    repo: 'prefix-dev/pixi',
  },
  distributable: {
    url: 'https://github.com/prefix-dev/pixi/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
      'cargo install --locked --path crates/pixi --root {{prefix}}',
    ],
  },
}
