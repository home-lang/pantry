import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getsynth.com',
  name: 'synth',
  description: 'The Declarative Data Generator',
  homepage: 'https://www.getsynth.com/',
  github: 'https://github.com/shuttle-hq/synth',
  programs: ['synth'],
  versionSource: {
    type: 'github-releases',
    repo: 'shuttle-hq/synth',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/shuttle-hq/synth/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path synth --root {{prefix}}',
    ],
  },
}
