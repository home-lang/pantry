import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'prettier.io',
  name: 'prettier',
  description: 'Code formatter for JavaScript, CSS, JSON, GraphQL, Markdown, YAML',
  homepage: 'https://prettier.io/',
  github: 'https://github.com/prettier/prettier',
  programs: ['prettier'],
  versionSource: {
    type: 'github-releases',
    repo: 'prettier/prettier',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://registry.npmjs.org/prettier/-/prettier-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^20',
  },
  buildDependencies: {
    'npmjs.com': '^10',
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
