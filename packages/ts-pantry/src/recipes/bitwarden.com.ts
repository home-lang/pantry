import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'bitwarden.com',
  name: 'bw',
  description: 'Secure and free password manager for all of your devices',
  homepage: 'https://bitwarden.com/',
  programs: ['bw'],
  distributable: {
    url: 'https://registry.npmjs.org/@bitwarden/cli/-/cli-{{version}}.tgz',
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
      'npm i husky',
      'npm i semver',
      'git init',
      'npm i $ARGS .',
      'cd "${{prefix}}/bin"',
      'ln -s ../libexec/bin/bw bw',
    ],
    env: {
      'ARGS': ['-ddd', '--global', '--build-from-source', '--prefix={{prefix}}/libexec', '--install-links', '--unsafe-perm'],
    },
  },
}
