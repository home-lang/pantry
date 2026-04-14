import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'perl.org',
  name: 'perl',
  description: 'Highly capable, feature-rich programming language',
  homepage: 'https://www.perl.org/',
  github: 'https://github.com/perl/perl5',
  programs: ['corelist', 'cpan', 'enc2xs', 'encguess', 'h2ph', 'h2xs', 'instmodsh', 'json_pp', 'libnetcfg', 'perl', 'perlbug', 'perldoc', 'perlivp', 'perlthanks', 'piconv', 'pl2pm', 'pod2html', 'pod2man', 'pod2text', 'pod2usage', 'podchecker', 'prove', 'ptar', 'ptardiff', 'ptargrep', 'shasum', 'splain', 'streamzip', 'xsubpp', 'zipdetails'],
  versionSource: {
    type: 'github-releases',
    repo: 'perl/perl5',
  },
  distributable: {
    url: 'https://www.cpan.org/src/{{ version.major }}.0/perl-{{ version }}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      './Configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
      'cd "{{prefix}}"/bin',
      'for x in *; do',
      '  case $x in',
      '  perl|perl{{version}})',
      '    ;;',
      '  *)',
      '    sed -i.bak \'s|^#!{{prefix}}/bin/|#!/usr/bin/env |\' $x',
      '    sed -i.bak \'s|exec {{prefix}}/bin/|exec |\' $x',
      '  esac',
      'done',
      '',
      'rm -f *.bak',
      '',
    ],
    env: {
      'ARGS': ['-d', '-e', '-Dprefix={{prefix}}', '-Duselargefiles', '-Dusethreads', '-Duseshrplib=false', '-Duserelocatableinc'],
    },
  },
}
