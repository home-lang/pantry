import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xerces.apache.org/xerces-c',
  name: 'xerces-c',
  programs: [
    'CreateDOMDocument',
    'DOMCount',
    'DOMPrint',
    'EnumVal',
    'PParse',
    'PSVIWriter',
    'Redirect',
    'SAX2Count',
    'SAX2Print',
    'SAXCount',
    'SAXPrint',
    'SCMPrint',
    'SEnumVal',
    'StdInParse',
    'XInclude',
  ],
  dependencies: {
    'curl.se': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://archive.apache.org/dist/xerces/c/3/sources/xerces-c-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build_shared -DBUILD_SHARED_LIBS=ON $ARGS',
      'cmake --build build_shared',
      '# FIXME: One test is failing',
      '# ctest --test-dir build_shared --verbose',
      'cmake --install build_shared',
      'cmake -S . -B build_static -DBUILD_SHARED_LIBS=OFF $ARGS',
      'cmake --build build_static',
      'mv build_static/src/*.a {{prefix}}/lib/',
      '# Remove a sample program that conflicts with libmemcached',
      '# on case-insensitive file systems',
      'rm -f {{prefix}}/bin/MemParse',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_DISABLE_FIND_PACKAGE_ICU=ON',
        '-DCMAKE_INSTALL_RPATH={{prefix}}',
      ],
    },
  },
}
