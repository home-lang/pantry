import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'heroku.com',
  name: 'heroku',
  description: 'CLI for Heroku',
  homepage: 'https://www.npmjs.com/package/heroku/',
  programs: ['heroku'],
  distributable: {
    url: 'https://registry.npmjs.org/heroku/-/heroku-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^20',
  },
  buildDependencies: {
    'npmjs.com': '*',
  },

  build: {
    script: [
      'npm i $ARGS .',
    ],
    env: {
      'ARGS': ['-ddd', '--global', '--build-from-source', '--prefix={{prefix}}', '--install-links', '--unsafe-perm'],
    },
  },
}
