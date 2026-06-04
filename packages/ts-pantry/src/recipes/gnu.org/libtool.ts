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
    'gnu.org/m4': 1,
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
      '  -exec sed -i -E "s#/[^ \\"=]*/_cc_wrapper/cc#cc#g; s#/var/buildkit[^ \\"=]*/cc#cc#g" {} + || true',
      'cd {{prefix}}/bin',
      'sed -i.bak \\',
      '  -e \'s_prefix={{prefix}}_prefix="$(dirname $(dirname $0))"_\' \\',
      '  -e \'s_{{prefix}}_$prefix_\' \\',
      '  libtoolize',
      'rm libtoolize.bak',
      '# often expected aliases',
      'ln -s libtoolize glibtoolize',
      'ln -s libtool glibtool',
    ],
  },
  test: {
    script: [
      'libtoolize',
      'test -f ltmain.sh',
    ],
  },
}
