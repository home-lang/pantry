import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'just.systems',
  name: 'just',
  description: 'Handy way to save and run project-specific commands',
  homepage: 'https://just.systems',
  github: 'https://github.com/casey/just',
  programs: ['just'],
  versionSource: {
    type: 'github-releases',
    repo: 'casey/just',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/casey/just/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.47.0',
    'rust-lang.org/cargo': '^0.75',
  },

  build: {
    script: [
      'cargo install --path=. --root={{prefix}}',
    ],
  },
}
