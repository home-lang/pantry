import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rpm.org/librepo',
  name: 'librepo',
  programs: [],
  platforms: ['linux'],
  dependencies: {
    'gnome.org/glib': '*',
    'gnome.org/libxml2': '*',
    'savannah.nongnu.org/attr': '*',
    'curl.se': '*',
    'openssl.org': '*',
    'rpm.org/rpm': '*',
    'rpm.org/popt': '*',
    'zlib.net': '*',
    'pcre.org/v2': '*',
    'sourceware.org/libffi': '*',
  },
  buildDependencies: {
    'cmake.org': '>=3.16',
    'gnu.org/gcc': '^14',
    'python.org': '>=3.9',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/rpm-software-management/librepo/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      {
        run: 'if [ -f "librepo.so.0" ]; then\n  mv "librepo.so.0" "librepo.so.0.{{version}}"\n  ln -sf "librepo.so.0.{{version}}" "librepo.so.0"\n  ln -sf "librepo.so.0" "librepo.so"\nfi\n',
        'working-directory': '${{prefix}}/lib',
      },
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DUSE_GPGME=OFF',
        '-DWITH_ZCHUNK=OFF',
        '-DENABLE_TESTS=OFF',
        '-DENABLE_PYTHON=OFF',
        '-DENABLE_DOCS=OFF',
      ],
    },
  },
  test: {
    script: [
      'test -f {{prefix}}/lib/librepo.so.0.{{version}}',
      'test -L {{prefix}}/lib/librepo.so.0',
      'test -L {{prefix}}/lib/librepo.so',
      'test -f {{prefix}}/include/librepo/librepo.h',
    ],
  },
}
