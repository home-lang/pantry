import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pugixml.org',
  name: 'pugixml',
  description: 'Light-weight, simple and fast XML parser for C++ with XPath support',
  homepage: 'https://pugixml.org/',
  github: 'https://github.com/zeux/pugixml',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'zeux/pugixml',
  },
  distributable: {
    url: 'https://github.com/zeux/pugixml/releases/download/v{{version.marketing}}/pugixml-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
      '',
    ],
    env: {
      'ARGS': ['-DBUILD_SHARED_LIBS=ON', '-DPUGIXML_BUILD_SHARED_AND_STATIC_LIBS=ON', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
