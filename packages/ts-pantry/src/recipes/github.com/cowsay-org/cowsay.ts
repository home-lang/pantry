import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cowsay-org/cowsay',
  name: 'cowsay',
  programs: [
    'cowsay',
  ],
  dependencies: {
    'perl.org': '^5',
  },
  buildDependencies: {
    'cpanmin.us': '*',
  },
  distributable: {
    url: 'https://github.com/cowsay-org/cowsay/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cpanm -l {{prefix}} File::Find',
        if: 'linux',
      },
      'make install prefix={{prefix}}',
    ],
  },
}
