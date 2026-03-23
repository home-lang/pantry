import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'onefetch.dev',
  name: 'onefetch',
  description: 'Command-line Git information tool',
  homepage: 'https://onefetch.dev/',
  github: 'https://github.com/o2sh/onefetch',
  programs: ['onefetch'],
  versionSource: {
    type: 'github-releases',
    repo: 'o2sh/onefetch',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/o2sh/onefetch/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
