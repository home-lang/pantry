import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/oneapi-src/oneTBB',
  name: 'oneTBB',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  buildDependencies: {
    'cmake.org': '*',
    'swig.org': '*',
    'freedesktop.org/pkg-config': '*',
  },
  // pkgx restricts to darwin + linux/x86-64 only:
  // linux/aarch64 fails with "undefined symbol: __aarch64_ldadd8_acq_rel".
  platforms: ['darwin', 'linux/x86-64'],
  distributable: {
    url: 'https://github.com/oneapi-src/oneTBB/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: 'cmake -S ../.. $CMAKE_ARGS -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_RPATH={{prefix}}\ncmake --build .\ncmake --install .\n',
        'working-directory': 'shared',
      },
      {
        run: 'cmake -S ../.. $CMAKE_ARGS -DBUILD_SHARED_LIBS=OFF -DCMAKE_INSTALL_RPATH={{prefix}}\ncmake --build .\ninstall ./*/libtbb*.a {{prefix}}/lib/\n',
        'working-directory': 'static',
      },
      {
        run: 'cmake -S ../.. $CMAKE_ARGS -DTBB4PY_BUILD=ON\nmake irml\ninstall clang*/* {{prefix}}/lib\nexport LDFLAGS="-L{{prefix}}/lib/libirml.so -lirml $LDFLAGS"\nexport PYTHONPATH="$PWD/build/python{{deps.python.org.version.marketing}}/site-packages:$PYTHONPATH"\npython ../../python/setup.py install --prefix=$PWD/build\n',
        if: 'linux',
        'working-directory': 'python',
      },
      {
        run: 'python3 -m pip install --prefix={{prefix}} .',
        'working-directory': '../python',
      },
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
    env: {
      TBBROOT: '{{prefix}}',
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DTBB_TEST=OFF',
      ],
      PYTHONPATH: '{{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages:$PYTHONPATH',
      linux: {
        CFLAGS: '$CFLAGS -Wl,--undefined-version',
      },
    },
  },
}
