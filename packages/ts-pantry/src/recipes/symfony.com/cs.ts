import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "symfony.com/cs",
  name: "cs",
  programs: [
    "php-cs-fixer",
  ],
  dependencies: {
    'php.net': ">=7.4<8.4",
  },
  distributable: {
    url: "https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/{{version.tag}}/php-cs-fixer.phar",
  },
  build: {
    script: [
      "install -D symfony.com∕cs-{{version}}.phar {{prefix}}/libexec/lib/php-cs-fixer.phar",
      {
        run: "cat > php-cs-fixer <<EOF\n#!/bin/sh\nexec php \\$(dirname \\$0)/../libexec/lib/php-cs-fixer.phar \"\\$@\"\nEOF\nchmod +x php-cs-fixer\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "php-cs-fixer --version | tee out",
      "grep {{version}} out",
      "cp $FIXTURE test.php",
      "php-cs-fixer fix test.php",
      "cp $FIXTURE composer.json\nphp-cs-fixer fix test.php\nphp-cs-fixer fix test.php",
      "php-cs-fixer fix test.php",
      "cat test.php | grep \"\\$this->foo('Hello World!');\"",
    ],
  },
}
