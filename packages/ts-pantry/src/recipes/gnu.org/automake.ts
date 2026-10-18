import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: '../props/gnu.org/automake',
  domain: 'gnu.org/automake',
  name: 'automake',
  programs: [
    'aclocal',
    'automake',
  ],
  dependencies: {
    'gnu.org/autoconf': '^2.65.0',
    'perl.org': '*',
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'gnu.org/make': '*',
    'gnu.org/sed': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/automake/automake-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --build={{ hw.target }} --prefix={{ prefix }}',
      'make -j {{ hw.concurrency }} install',
      {
        run: "perl -pi -e \"s|'\\Q{{prefix}}\\E/|\\\\\\$prefix.'/|\" bin/* share/automake-{{version.marketing}}/Automake/Config.pm\nsed 's/automake-1.16/automake-{{version.marketing}}/g' \"$SRCROOT\"/props/relocatable.diff | patch -p1\nln -sf aclocal bin/aclocal-{{version.marketing}}\nln -sf automake bin/automake-{{version.marketing}}\nfix-shebangs.ts bin/*",
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      PERL5LIB: '{{prefix}}/share/automake-{{version.marketing}}',
    },
  },
  test: {
    required: true,
    script: [
      'printf "AC_INIT([pantry-automake-check], [1.0])\\nAC_CONFIG_SRCDIR([probe.c])\\nAC_CONFIG_AUX_DIR([build-aux])\\nAM_INIT_AUTOMAKE([foreign])\\nAC_PROG_CC\\nAC_CONFIG_FILES([Makefile])\\nAC_OUTPUT\\n" > configure.ac',
      'printf "int main(void) { return 0; }\\n" > probe.c',
      'printf "bin_PROGRAMS = probe\\nprobe_SOURCES = probe.c\\n" > Makefile.am',
      'autoreconf --force --install',
      './configure',
      'make',
      './probe',
    ],
  },
}
