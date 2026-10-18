import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libtool',
  name: 'libtool',
  programs: [
    'libtool',
    'libtoolize',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '^2.65.0',
    'gnu.org/automake': '^1',
    'gnu.org/make': '*',
    'gnu.org/sed': '*',
    'gnu.org/findutils': '*',
    'gnu.org/m4': '1',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libtool/libtool-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
      // configure bakes the buildkit compiler-wrapper path (".../_cc_wrapper/cc"
      // or "/var/buildkit/.../cc") into the installed bin/libtool and ltmain.sh.
      // That path only exists inside libtool's transient sandbox, so every
      // downstream package that drives its build through this dep's libtool
      // (e.g. leonerd.org.uk/libtermkey) dies with "cc: No such file or
      // directory". Replace any recorded wrapper path with a plain "cc".
      'find {{prefix}} -type f \\( -name libtool -o -name ltmain.sh -o -name "*.m4" \\) \\',
      '  -exec sed -i -E "s#/[^ \\"=]*/_cc_wrapper/cc#cc#g; s#/var/buildkit[^ \\"=]*/cc#cc#g" {} +',
      'cd {{prefix}}/bin',
      'sed -i.bak \\',
      '  -e \'s|^[[:space:]]*prefix=.*|  prefix="$(dirname "$(dirname "$0")")"|\' \\',
      '  -e \'s_{{prefix}}_$prefix_\' \\',
      '  libtoolize',
      'rm libtoolize.bak',
      '# often expected aliases',
      'ln -s libtoolize glibtoolize',
      'ln -s libtool glibtool',
    ],
  },
  test: {
    required: true,
    script: [
      'libtool --version | grep -F "{{version}}"',
      'mkdir "relocated tools"',
      'cp -R "{{prefix}}/." "relocated tools/"',
      'printf "AC_INIT([pantry-libtool-check], [1.0])\\nAC_CONFIG_SRCDIR([probe.c])\\nAC_CONFIG_AUX_DIR([build-aux])\\nAM_INIT_AUTOMAKE([foreign])\\nAC_PROG_CC\\nLT_INIT\\nAC_CONFIG_FILES([Makefile])\\nAC_OUTPUT\\n" > configure.ac',
      'printf "int pantry_probe(void) { return 42; }\\n" > probe.c',
      'printf "extern int pantry_probe(void); int main(void) { return pantry_probe() != 42; }\\n" > main.c',
      'printf "lib_LTLIBRARIES = libprobe.la\\nlibprobe_la_SOURCES = probe.c\\nbin_PROGRAMS = probe\\nprobe_SOURCES = main.c\\nprobe_LDADD = libprobe.la\\n" > Makefile.am',
      '"$PWD/relocated tools/bin/libtoolize" --copy --install',
      'autoreconf --force --install',
      './configure',
      'make',
      './probe',
    ],
  },
}
