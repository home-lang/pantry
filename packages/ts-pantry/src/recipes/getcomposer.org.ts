import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'getcomposer.org',
  name: 'composer',
  description: 'Dependency Manager for PHP',
  homepage: 'https://getcomposer.org/',
  github: 'https://github.com/composer/composer',
  programs: ['composer', 'composer.phar'],
  versionSource: {
    type: 'github-releases',
    repo: 'composer/composer',
  },
  dependencies: {
    'php.net': '*',
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'curl -sSLO https://github.com/composer/composer/releases/download/{{version}}/composer.phar',
      'install -D composer.phar {{prefix}}/bin/composer.phar',
      'cd "${{prefix}}/bin"',
      'ln -sf composer.phar composer',
    ],
  },
}
