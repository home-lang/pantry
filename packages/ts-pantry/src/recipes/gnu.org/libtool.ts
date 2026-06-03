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
      'cd {{prefix}}/bin',
      'sed -i.bak \\',
      '  -e \'s_prefix="{{prefix}}"_prefix="$(dirname $(dirname $0))"_\' \\',
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
