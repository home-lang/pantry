import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'dns.lookup.dog',
  name: 'dog',
  description: 'A command-line DNS client.',
  homepage: 'https://dns.lookup.dog/',
  github: 'https://github.com/ogham/dog',
  programs: ['dog'],
  versionSource: {
    type: 'github-releases',
    repo: 'ogham/dog',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/ogham/dog/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'rm -f rust-toolchain.toml',
      'rustup default stable',
      'cargo install --locked --path . --root {{prefix}}',
      '',
    ],
    env: {
      'RUSTFLAGS': '--cap-lints warn',
    },
  },
}
