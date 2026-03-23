import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'symfony.com',
  name: 'symfony',
  description: 'The Symfony CLI tool',
  homepage: 'https://symfony.com/download',
  github: 'https://github.com/symfony-cli/symfony-cli',
  programs: ['symfony'],
  versionSource: {
    type: 'github-releases',
    repo: 'symfony-cli/symfony-cli',
  },
  distributable: {
    url: 'https://github.com/symfony-cli/symfony-cli/releases/download/v{{version}}/symfony-cli-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'php.net': '*',
  },
  buildDependencies: {
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      'curl -L https://github.com/symfony-cli/symfony-cli/releases/download/v{{version}}/symfony-cli_$TYPE.tar.gz | tar -xzf -',
      'mkdir -p {{prefix}}/bin',
      'install ./symfony {{prefix}}/bin/symfony',
    ],
  },
}
