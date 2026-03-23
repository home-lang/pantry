import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'replibyte.com',
  name: 'replibyte',
  description: 'Seed your development database with real data ⚡️',
  homepage: 'https://www.replibyte.com',
  github: 'https://github.com/Qovery/Replibyte',
  programs: ['replibyte'],
  versionSource: {
    type: 'github-releases',
    repo: 'Qovery/Replibyte',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/Qovery/Replibyte/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
