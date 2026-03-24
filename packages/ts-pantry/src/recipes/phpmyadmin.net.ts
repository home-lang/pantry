import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
