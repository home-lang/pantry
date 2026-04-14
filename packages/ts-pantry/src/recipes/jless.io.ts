import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jless.io',
  name: 'jless',
  description: 'jless is a command-line JSON viewer designed for reading, exploring, and searching through JSON data.',
  homepage: 'https://jless.io/',
  github: 'https://github.com/PaulJuliusMartinez/jless',
  programs: ['jless'],
  versionSource: {
    type: 'github-releases',
    repo: 'PaulJuliusMartinez/jless',
  },
  distributable: {
    url: 'https://github.com/PaulJuliusMartinez/jless/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'python.org': '3',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
