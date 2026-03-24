import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rye.astral.sh',
  name: 'rye',
  description: 'Experimental Package Management Solution for Python',
  homepage: 'https://rye-up.com/',
  github: 'https://github.com/astral-sh/rye',
  programs: ['rye'],
  versionSource: {
    type: 'github-releases',
    repo: 'astral-sh/rye',
  },
  distributable: {
    url: 'https://github.com/astral-sh/rye/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path rye --root {{prefix}}',
    ],
  },
}
