import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/stow',
  name: 'stow',
  programs: [
    'stow',
  ],
  dependencies: {
    'perl.org': '^5.6.1',
  },
  buildDependencies: {
    'cpanmin.us': '^1',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/stow/stow-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cpanm -l {{prefix}} Test::More Test::Output',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'fix-shebangs.ts {{prefix}}/bin/*',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--with-pmdir={{prefix}}/lib/perl{{deps.perl.org.version.major}}',
      ],
      PERL5LIB: '${{prefix}}/lib/perl{{deps.perl.org.version.major}}',
    },
  },
}
