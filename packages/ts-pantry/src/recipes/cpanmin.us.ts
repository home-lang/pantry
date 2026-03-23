import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cpanmin.us',
  name: 'cpanm',
  description: 'cpanminus - get, unpack, build and install modules from CPAN ',
  homepage: 'http://cpanmin.us',
  github: 'https://github.com/miyagawa/cpanminus',
  programs: ['cpanm'],
  versionSource: {
    type: 'github-releases',
    repo: 'miyagawa/cpanminus/tags',
  },
  distributable: {
    url: 'https://cpan.metacpan.org/authors/id/M/MI/MIYAGAWA/App-cpanminus-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'perl.org': '*',
  },

  build: {
    script: [
      'perl Makefile.PL INSTALL_BASE={{prefix}}',
      'make install',
      '',
      'fix-shebangs.ts {{prefix}}/bin/cpanm',
      '',
    ],
  },
}
