import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gaia-gis.it/fossil/freexl',
  name: 'freexl',
  programs: [],
  dependencies: {
    'zlib.net/minizip': '^1',
    'libexpat.github.io': '^2',
  },
  buildDependencies: {
    'doxygen.nl': 1,
  },
  distributable: {
    url: 'https://www.gaia-gis.it/gaia-sins/freexl-sources/freexl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // zlib.net/minizip is not published as a standalone binary in the pantry
      // registry, so freexl's configure can't find minizip/unzip.h via the usual
      // dependency staging. Build minizip from zlib's bundled contrib/minizip and
      // install it into freexl's own prefix (which is on CPATH/LDFLAGS), so the
      // ./configure check passes and the resulting libfreexl is self-contained.
      'mkdir -p _minizip && cd _minizip',
      'curl -fsSL https://github.com/madler/zlib/archive/refs/tags/v1.3.1.tar.gz -o zlib.tar.gz',
      'tar xzf zlib.tar.gz',
      'cd zlib-1.3.1/contrib/minizip',
      'autoreconf -fi',
      './configure --prefix={{prefix}}',
      'make --jobs {{ hw.concurrency }} install',
      'cd "$SRCROOT"',
      // Now build freexl against the just-installed minizip.
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
      'linux/aarch64': {
        ARGS: [
          '--build=aarch64-unknown-linux-gnu',
        ],
      },
      'linux/x86-64': {
        ARGS: [
          '--build=x86_64-unknown-linux-gnu',
        ],
      },
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -lfreexl',
      './a.out',
    ],
  },
}
