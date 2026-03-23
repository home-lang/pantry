import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'uriparser.github.io',
  name: 'uriparse',
  description: ' :hocho: Strictly RFC 3986 compliant URI parsing and handling library written in C89; moved from SourceForge to GitHub',
  homepage: 'https://uriparser.github.io/',
  github: 'https://github.com/uriparser/uriparser',
  programs: ['uriparse'],
  versionSource: {
    type: 'github-releases',
    repo: 'uriparser/uriparser',
    tagPattern: /\/^uriparser-\//,
  },
  distributable: {
    url: 'https://github.com/uriparser/uriparser/releases/download/uriparser-{{version}}/uriparser-{{version}}.tar.bz2',
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
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DURIPARSER_BUILD_TESTS=OFF', '-DURIPARSER_BUILD_DOCS=OFF'],
    },
  },
}
