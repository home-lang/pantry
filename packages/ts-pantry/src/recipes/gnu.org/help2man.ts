import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/help2man",
  name: "help2man",
  programs: [
    "help2man",
  ],
  dependencies: {
    'gnu.org/gettext': "^0",
    'perl.org': "~5.42",
  },
  buildDependencies: {
    'cpanmin.us': "*",
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/help2man/help2man-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "WRAP=$(mktemp -d)\ninstall -Dm755 $PROP $WRAP/cc\nPATH=\"$WRAP:$PATH\" CC=\"$WRAP/cc\" cpanm -l {{prefix}} Locale::gettext\nrm -rf \"$WRAP\"",
        if: "darwin",
      },
      {
        run: "cpanm -l {{prefix}} Locale::gettext",
        if: "linux",
      },
      "./configure $CONFIGURE_ARGS",
      "make install",
      {
        run: "sed -i '1s|.*|#!/usr/bin/env perl|' help2man",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      PERL5LIB: {{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB,
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\{{prefix}}\",
        "--libdir=\{{prefix}}/lib\",
      ],
      darwin: {
        LDFLAGS: "$LDFLAGS -Wl,-headerpad_max_install_names",
      },
    },
  },
  test: {
    script: [
      "help2man --version | grep {{version}}",
      "help2man --locale=en_US.UTF-8 help2man | grep {{version}}",
    ],
  },
}
