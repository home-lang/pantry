import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'laravel.com',
  name: 'laravel',
  description: 'The Laravel application installer.',
  homepage: 'https://laravel.com/docs',
  github: 'https://github.com/laravel/installer',
  programs: ['laravel'],
  versionSource: {
    type: 'github-releases',
    repo: 'laravel/installer',
  },
  distributable: {
    url: 'https://github.com/laravel/installer/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'php.net': '^8.2',
    'getcomposer.org': '^2.7',
  },

  build: {
    script: [
      'cd "bin"',
      'perl -pi -e "s/\'Laravel Installer\', \'[0-9\\.]*\'/\'Laravel Installer\', \'{{version}}\'/" laravel',
      'composer install --no-dev',
      'mkdir -p {{prefix}}/libexec',
      'cp -r ./* {{prefix}}/libexec',
      'cd "${{prefix}}/bin"',
      'ln -s ../libexec/bin/laravel laravel',
      'cd "${{prefix}}/libexec/src"',
      'sed -i -f $PROP NewCommand.php',
    ],
  },
}
