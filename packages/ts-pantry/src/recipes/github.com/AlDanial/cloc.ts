import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/AlDanial/cloc',
  name: 'cloc',
  programs: [
    'cloc',
  ],
  dependencies: {
    'perl.org': '^5',
  },
  buildDependencies: {
    'cpanmin.us': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/AlDanial/cloc/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cpanm -l {{prefix}} $PKGS',
      'make --jobs {{ hw.concurrency }} -C Unix prefix={{prefix}} install',
      {
        run: 'fix-shebangs.ts cloc config_data',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      PKGS: [
        'Regexp::Common',
        'Algorithm::Diff',
        'Parallel::ForkManager',
        'Sub::Quote',
        'Moo::Role',
        'Module::Runtime',
        'Role::Tiny',
        'Devel::GlobalDestruction',
        'Sub::Exporter::Progressive',
      ],
      PERL5LIB: '$PERL5LIB:{{prefix}}/lib/perl5',
    },
  },
  test: {
    script: [
      'cloc --csv . | grep 1,C,0,0,5',
      'test "v$(cloc --version)" = "{{version.tag}}"',
    ],
  },
}
