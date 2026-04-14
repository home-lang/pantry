import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'po4a.org',
  name: 'po4a',
  description: 'Maintain the translations of your documentation with ease  (PO for anything)',
  homepage: 'https://po4a.org/',
  github: 'https://github.com/mquinson/po4a',
  programs: ['msguntypot', 'po4a', 'po4a-display-man', 'po4a-display-pod', 'po4a-gettextize', 'po4a-normalize', 'po4a-updatepo', 'podselect'],
  versionSource: {
    type: 'github-releases',
    repo: 'mquinson/po4a',
  },
  distributable: {
    url: 'https://github.com/mquinson/po4a/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gettext': '^0.22',
    'perl.org': '^5.22',
    'gnome.org/libxslt': '^1.1',
  },
  buildDependencies: {
    'cpanmin.us': '*',
    'docbook.org/xsl': '*',
    'curl.se': '*',
  },

  build: {
    script: [
      'cpanm -l {{prefix}}/libexec $PKGS --force --notest --verbose',
      'cd "pkgs/SGMLSpm"',
      'curl -L "https://cpan.metacpan.org/authors/id/R/RA/RAAB/SGMLSpm-1.1.tar.gz" | \\',
      '  tar -xz --strip-components=1',
      'cpanm -l {{prefix}}/libexec .',
      '',
      'cd "pkgs/TermReadKey"',
      'curl -L "https://cpan.metacpan.org/authors/id/J/JS/JSTOWE/TermReadKey-2.38.tar.gz" | \\',
      '  tar -xz --strip-components=1',
      'cpanm -l {{prefix}}/libexec .',
      '',
      'sed -i -e "s|/usr/share/xml/docbook/stylesheet/docbook-xsl|{{deps.docbook.org/xsl.prefix}}/libexec/docbook-xsl-ns|" -e "s/if ( \\$\\^O ne \'MSWin32\' )/if (0)/" Po4aBuilder.pm',
      'perl Build.PL --install_base {{prefix}}/libexec',
      './Build',
      './Build install',
      'cd "${{prefix}}/share/man"',
      'ln -s ../../libexec/man/man? .',
      'cd "${{prefix}}/libexec/bin"',
      'sed -i "s|{{deps.perl.org.prefix}}/bin/perl|/usr/bin/env perl|" *',
      'cd "${{prefix}}"',
      'ln -s ./libexec/bin bin',
    ],
    env: {
      'PERL5LIB': '${{prefix}}/libexec/lib/perl5:$PERL5LIB',
      'PKGS': ['Locale::gettext', 'Module::Build', 'Pod::Parser', 'Text::WrapI18N', 'Unicode::GCString', 'YAML::Tiny', 'ExtUtils::CChecker', 'XS::Parse::Keyword::Builder', 'Syntax::Keyword::Try', 'Module::Build'],
    },
  },
}
