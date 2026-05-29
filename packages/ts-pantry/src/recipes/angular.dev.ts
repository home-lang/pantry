import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
      { run: 'ln -s ../libexec/bin/ng ng', 'working-directory': '{{prefix}}/bin' },
    ],
    env: {
      'ARGS': ['-ddd', '--global', '--build-from-source', '--prefix={{prefix}}/libexec', '--install-links', '--unsafe-perm'],
    },
  },
}
