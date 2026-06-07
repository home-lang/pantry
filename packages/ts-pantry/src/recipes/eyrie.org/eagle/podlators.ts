import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'eyrie.org/eagle/podlators',
  name: 'podlators',
  programs: [
    'pod2man',
    'pod2text',
  ],
  dependencies: {
    'perl.org': '^5',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/wget': '*',
    linux: {
      'cpanmin.us': '^1',
    },
  },
  distributable: {
    url: 'https://archives.eyrie.org/software/perl/podlators-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cpanm -l {{prefix}} $PKGS',
        if: 'linux',
      },
      'wget https://cpan.metacpan.org/authors/id/K/KH/KHW/Pod-Simple-3.43.tar.gz',
      'tar -xzf Pod-Simple-3.43.tar.gz',
      {
        run: 'perl Makefile.PL INSTALL_BASE={{prefix}}/libexec\nmake --jobs {{ hw.concurrency }}\nmake --jobs {{ hw.concurrency }} install\n',
        'working-directory': 'Pod-Simple-3.43',
      },
      'perl Makefile.PL $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
      {
        run: "sed -i.bak -E -e 's|/.*/bin/perl|/usr/bin/env perl|g' pod2man pod2text\nrm pod2man.bak pod2text.bak\n",
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      PERL5LIB: '{{prefix}}/libexec/lib/perl5:{{prefix}}/lib/perl5:$PERL5LIB',
      ARGS: [
        'INSTALL_BASE={{prefix}}',
        'INSTALLSITEMAN1DIR={{prefix}}/man/man1',
        'INSTALLSITEMAN3DIR={{prefix}}/man/man3',
      ],
      linux: {
        PKGS: [
          'ExtUtils::MakeMaker',
          'Pod::Escapes',
        ],
      },
    },
  },
  test: {
    script: [
      "pod2man test.pod | grep 'Pod::Man {{version.major}}'",
    ],
  },
}
