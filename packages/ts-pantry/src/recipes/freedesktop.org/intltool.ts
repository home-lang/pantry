import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/intltool',
  name: 'intltool',
  programs: [
    'intltool-extract',
    'intltool-merge',
    'intltool-prepare',
    'intltool-update',
    'intltoolize',
    'lwp-download',
    'lwp-dump',
    'lwp-mirror',
    'lwp-request',
  ],
  dependencies: {
    'perl.org': '~5',
    linux: {
      'libexpat.github.io': '^2.6',
    },
  },
  buildDependencies: {
    'cpanmin.us': '*',
  },
  distributable: {
    url: 'https://launchpad.net/intltool/trunk/{{version}}/+download/intltool-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cpanm -l {{prefix}} XML::Parser File::Basename Getopt::Long --force --verbose',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      {
        run: 'fix-shebangs.ts *',
        'working-directory': '{{prefix}}/bin',
      },
      {
        run: 'sed -i \'s/\\+brewing//g\' intltoolize',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      PERL5LIB: '${{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB',
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'intltool-extract --help',
      'intltoolize --version | grep {{version}}',
      'intltool-extract --type=gettext/xml test.xml',
      'cat test.xml.h | grep \'This comment is not ignored\'',
      'cat test.xml.h | grep \'This comment is ignored\' || true',
    ],
  },
}
