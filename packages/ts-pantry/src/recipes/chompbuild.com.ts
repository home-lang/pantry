import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'chompbuild.com',
  name: 'chomp',
  description: '\\',
  homepage: 'https://chompbuild.com',
  github: 'https://github.com/guybedford/chomp',
  programs: ['chomp'],
  versionSource: {
    type: 'github-releases',
    repo: 'guybedford/chomp',
  },
  distributable: {
    url: 'https://github.com/guybedford/chomp/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
