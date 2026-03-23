import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'rapidjson.org',
  name: 'rapidjson',
  description: 'A fast JSON parser/generator for C++ with both SAX/DOM style API',
  homepage: 'http://rapidjson.org/',
  github: 'https://github.com/Tencent/rapidjson',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'Tencent/rapidjson/tags',
  },
  distributable: {
    url: 'https://github.com/Tencent/rapidjson/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '3',
    'doxygen.nl': '1',
    'gnu.org/patch': '*',
  },

  build: {
    script: [
      'patch -p1 < props/gcc-clang.patch',
      'cmake . $ARGS',
      'sed -i -e "s/-march=native//" -e "s/-Werror//" CMakeLists.txt',
      'make . install',
    ],
    env: {
      'ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DRAPIDJSON_BUILD_EXAMPLES=OFF'],
    },
  },
}
