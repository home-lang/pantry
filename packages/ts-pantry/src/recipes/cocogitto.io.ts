import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cocogitto.io',
  name: 'cog',
  description: 'The Conventional Commits toolbox',
  homepage: 'https://docs.cocogitto.io',
  github: 'https://github.com/cocogitto/cocogitto',
  programs: ['cog'],
  versionSource: {
    type: 'github-releases',
    repo: 'cocogitto/cocogitto',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/cocogitto/cocogitto/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo build --release',
      'mkdir -p {{prefix}}/bin',
      'cp target/release/cog {{prefix}}/bin/',
    ],
  },
}
