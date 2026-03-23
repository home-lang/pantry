import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'convco.github.io',
  name: 'convco',
  description: 'Conventional commits, changelog, versioning, validation',
  homepage: 'https://convco.github.io',
  github: 'https://github.com/convco/convco',
  programs: ['convco'],
  versionSource: {
    type: 'github-releases',
    repo: 'convco/convco',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/convco/convco/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
      '',
    ],
  },
}
