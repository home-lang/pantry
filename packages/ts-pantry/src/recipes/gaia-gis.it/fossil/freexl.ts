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
      // Compile the library objects directly rather than via autoreconf — the
      // build sandbox's autoconf can't locate its m4sugar macros.
      'mkdir -p _minizip && cd _minizip',
      'curl -fsSL https://github.com/madler/zlib/archive/refs/tags/v1.3.1.tar.gz -o zlib.tar.gz',
      'tar xzf zlib.tar.gz',
      'cd zlib-1.3.1/contrib/minizip',
      'mkdir -p {{prefix}}/include/minizip {{prefix}}/lib/pkgconfig',
      'cc -O2 -fPIC -DUSE_FILE32API -c ioapi.c unzip.c zip.c mztools.c',
      'cc -shared -Wl,-soname,libminizip.so.1 -o libminizip.so.1.0.0 ioapi.o unzip.o zip.o mztools.o -lz',
      'ar rcs libminizip.a ioapi.o unzip.o zip.o mztools.o',
      'cp libminizip.so.1.0.0 {{prefix}}/lib/',
      'ln -sf libminizip.so.1.0.0 {{prefix}}/lib/libminizip.so.1',
      'ln -sf libminizip.so.1.0.0 {{prefix}}/lib/libminizip.so',
      'cp libminizip.a {{prefix}}/lib/',
      'cp crypt.h ioapi.h unzip.h zip.h mztools.h {{prefix}}/include/minizip/',
      'printf \'prefix={{prefix}}\\nexec_prefix=${prefix}\\nlibdir=${prefix}/lib\\nincludedir=${prefix}/include\\n\\nName: minizip\\nDescription: Minizip zip manipulation library\\nVersion: 1.3.1\\nRequires: zlib\\nLibs: -L${libdir} -lminizip\\nCflags: -I${includedir}\\n\' > {{prefix}}/lib/pkgconfig/minizip.pc',
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
