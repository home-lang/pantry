import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nushell.sh',
  name: 'nu',
  description: 'Modern shell for the GitHub era',
  homepage: 'https://www.nushell.sh',
  github: 'https://github.com/nushell/nushell',
  programs: ['nu'],
  versionSource: {
    type: 'github-releases',
    repo: 'nushell/nushell/tags',
  },
  distributable: {
    url: 'https://github.com/nushell/nushell/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.60.0',
    'rust-lang.org/cargo': '^0.87',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      'cargo install --path=. --root={{prefix}} --locked',
    ],
  },
}
