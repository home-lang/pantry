import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'angular.dev',
  name: 'ng',
  description: 'CLI tool for Angular',
  homepage: 'https://angular.dev/cli/',
  programs: ['ng'],
  distributable: {
    url: 'https://registry.npmjs.org/@angular/cli/-/cli-{{version}}.tgz',
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
      'cd "{{prefix}}/bin"',
      'ln -s ../libexec/bin/ng ng',
    ],
    env: {
      'ARGS': ['-ddd', '--global', '--prefix={{prefix}}/libexec', '--install-links', '--unsafe-perm'],
    },
  },
}
