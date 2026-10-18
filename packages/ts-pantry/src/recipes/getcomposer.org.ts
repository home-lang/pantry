import type { Recipe } from '../../scripts/recipe-types'
import { githubAssetBuildDependencies, githubAssetSteps } from '../../scripts/github-asset-recipe'

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
  buildDependencies: githubAssetBuildDependencies,

  build: {
    script: [
      ...githubAssetSteps('composer/composer', '{{version}}', 'composer.phar', 'composer.phar'),
      'install -Dm755 composer.phar "{{prefix}}/bin/composer.phar"',
      'ln -s composer.phar "{{prefix}}/bin/composer"',
    ],
  },
  test: { required: true, script: ['composer --version | grep -F "{{version}}"'] },
}
