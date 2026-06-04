import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: '../props/gnu.org/automake',
  domain: "gnu.org/automake",
  name: "automake",
  programs: [
    "aclocal",
    "automake",
  ],
  dependencies: {
    'gnu.org/autoconf': "^2.65.0",
    'perl.org': "*",
  },
  buildDependencies: {
    'gnu.org/patch': "*",
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/automake/automake-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure --build={{ hw.target }} --prefix={{ prefix }}",
      "make -j {{ hw.concurrency }} install",
      {
        run: "perl -pi -e \"s|'\\Q{{prefix}}\\E/|\\\\\\$prefix.'/|\" bin/* share/automake-{{version.marketing}}/Automake/Config.pm\nsed 's/automake-1.16/automake-{{version.marketing}}/g' \"$SRCROOT\"/props/relocatable.diff | patch -p1\nln -sf aclocal bin/aclocal-{{version.marketing}}\nln -sf automake bin/automake-{{version.marketing}}\nfix-shebangs.ts bin/*",
        'working-directory': "{{prefix}}",
      },
    ],
    env: {
      PERL5LIB: "{{prefix}}/share/automake-{{version.marketing}}",
    },
  },
  test: {
    script: [
      "aclocal",
      "automake --add-missing --foreign",
      "autoconf",
      "./configure",
      "make",
      "./test",
    ],
  },
}
