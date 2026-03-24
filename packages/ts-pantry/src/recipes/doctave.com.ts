import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'doctave.com',
  name: 'doctave',
  description: 'A batteries-included developer documentation site generator',
  homepage: 'https://cli.doctave.com',
  github: 'https://github.com/Doctave/doctave',
  programs: ['doctave'],
  versionSource: {
    type: 'github-releases',
    repo: 'Doctave/doctave',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/Doctave/doctave/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
