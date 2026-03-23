import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'typescriptlang.org',
  name: 'tsc',
  description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
  homepage: 'https://www.typescriptlang.org/',
  github: 'https://github.com/Microsoft/TypeScript',
  programs: ['tsc'],
  versionSource: {
    type: 'github-releases',
    repo: 'Microsoft/TypeScript',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://registry.npmjs.org/typescript/-/typescript-{{version}}.tgz',
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
      'npm install $ARGS',
    ],
    env: {
      'ARGS': ['-ddd', '--global', '--build-from-source', '--prefix={{prefix}}', '--install-links', '--unsafe-perm'],
    },
  },
}
