import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'libraw.org',
  name: 'libraw',
  description: 'Library for reading RAW files from digital photo cameras',
  homepage: 'https://www.libraw.org/',
  programs: ['4channels', 'dcraw_emu', 'dcraw_half', 'half_mt', 'mem_image', 'multirender_test', 'postprocessing_benchmark', 'raw-identify', 'rawtextdump', 'simple_dcraw', 'unprocessed_raw'],
  distributable: {
    url: 'https://www.libraw.org/data/LibRaw-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/jasper-software/jasper': '*',
    'libjpeg-turbo.org': '*',
    'littlecms.com': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      './configure $ARGS ac_cv_prog_c_openmp=\'-Xpreprocessor -fopenmp\' ac_cv_prog_cxx_openmp=\'-Xpreprocessor -fopenmp\' || { cat config.log; exit 1; }',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
      'mkdir -p {{prefix}}/doc',
      'install doc/* {{prefix}}/doc/',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-dependency-tracking'],
    },
  },
}
