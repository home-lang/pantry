import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'taglib.org',
  name: 'taglib-config',
  description: 'TagLib Audio Meta-Data Library',
  homepage: 'https://taglib.org/',
  github: 'https://github.com/taglib/taglib',
  programs: ['taglib-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'taglib/taglib',
  },
  distributable: {
    url: 'https://taglib.github.io/releases/taglib-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'github.com/nemtrif/utfcpp': '^4',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $CMAKE_ARGS',
      'make --jobs {{hw.concurrency}} install',
      'cd "{{prefix}}/bin"',
      'sed -i -e "s|prefix=|prefix=\\$(dirname \\$0)/..|g" -e "s|{{prefix}}|\\$(dirname \\$0)/..|g" taglib-config',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DWITH_MP4=ON', '-DWITH_ASF=ON', '-DBUILD_SHARED_LIBS=ON'],
    },
  },
}
