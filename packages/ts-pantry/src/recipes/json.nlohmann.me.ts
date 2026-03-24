import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'json.nlohmann.me',
  name: 'json.nlohmann.me',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'nlohmann/json',
  },
  distributable: {
    url: 'https://github.com/nlohmann/json/releases/download/{{version.tag}}/json.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '3',
  },

  build: {
    script: [
      'cmake -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DJSON_BuildTests=OFF', '-DJSON_MultipleHeaders=ON'],
    },
  },
}
