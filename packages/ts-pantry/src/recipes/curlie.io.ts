import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curlie.io',
  name: 'curlie',
  description: 'The power of curl, the ease of use of httpie.',
  homepage: 'https://rs.github.io/curlie',
  github: 'https://github.com/rs/curlie',
  programs: ['curlie'],
  versionSource: {
    type: 'github-releases',
    repo: 'rs/curlie',
  },
  distributable: {
    url: 'git+https://github.com/rs/curlie',
  },
  buildDependencies: {
    'go.dev': '~1.24',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'go build -ldflags="-s -w" -o {{prefix}}/bin/curlie .',
    ],
  },
}
