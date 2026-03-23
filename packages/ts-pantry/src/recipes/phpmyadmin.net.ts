import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'phpmyadmin.net',
  name: 'phpMyAdmin',
  programs: [],
  distributable: {
    url: 'https://files.phpmyadmin.net/phpMyAdmin/{{version}}/phpMyAdmin-{{version}}-all-languages.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'php.net': '*',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/share',
      'mv ./* {{prefix}}/share',
      '',
    ],
  },
}
