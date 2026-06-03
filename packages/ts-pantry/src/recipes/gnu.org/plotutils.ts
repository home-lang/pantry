import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/plotutils',
  name: 'plotutils',
  programs: [
    'double',
    'graph',
    'ode',
    'pic2plot',
    'plot',
    'plotfont',
    'spline',
    'tek2plot',
  ],
  dependencies: {
    'libpng.org': '^1.6',
    'libraw.org': '^0.21',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/plotutils/plotutils-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i "s|register ||g" pic2plot/gram.cc',
        if: 'linux',
      },
      {
        run: 'sed -i "s|png_ptr->jmpbuf|png_jmpbuf (png_ptr)|g" z_write.c',
        'working-directory': 'libplot',
      },
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
        '--enable-libplotter',
      ],
      darwin: {
        ARGS: [
          '--without-x',
        ],
      },
      'linux/aarch64': {
        ARGS: [
          '--build=aarch64-unknown-linux-gnu',
        ],
      },
    },
  },
  test: {
    script: [
      'plot --version | grep {{version.marketing}}',
      'graph -T png test.dat > test.png',
    ],
  },
}
