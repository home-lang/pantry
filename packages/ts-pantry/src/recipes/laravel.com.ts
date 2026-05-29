import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
      // 5.11.1 shipped as 5.11.0 — pin the reported version
      {
        run: 'sed -i "s/\'Laravel Installer\', \'[0-9\\.]*\'/\'Laravel Installer\', \'{{version}}\'/" laravel',
        'working-directory': 'bin',
      },
      'composer install --no-dev',
      'mkdir -p {{prefix}}/libexec',
      'cp -r ./* {{prefix}}/libexec',
      {
        run: 'ln -s ../libexec/bin/laravel laravel',
        'working-directory': '${{prefix}}/bin',
      },
      // patch installer so `laravel new` projects pass LD_LIBRARY_PATH to `artisan serve`
      {
        run: 'sed -i -f $PROP NewCommand.php',
        if: 'linux',
        'working-directory': '${{prefix}}/libexec/src',
        prop: {
          content: '/))->isSuccessful/a\\\n            $this->replaceInFile("\'PATH\',", "\'PATH\',\\n        \'LD_LIBRARY_PATH\',", "$directory/vendor/laravel/framework/src/Illuminate/Foundation/Console/ServeCommand.php");\n',
        },
      },
    ],
  },
}
