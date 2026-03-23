import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'jetporch.com',
  name: 'jetp',
  description: 'Read-only mirror: see https://www.jetporch.com/community/sourcehut',
  github: 'https://github.com/jetporch/jetporch',
  programs: ['jetp'],
  versionSource: {
    type: 'github-releases',
    repo: 'jetporch/jetporch',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/jetporch/jetporch/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'openssl.org': '*',
    'zlib.net': '*',
    'rust-lang.org': '>=1.70',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'sh version.sh',
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      'OPENSSL_STATIC': '1',
      'ZLIB_STATIC': '1',
    },
  },
}
