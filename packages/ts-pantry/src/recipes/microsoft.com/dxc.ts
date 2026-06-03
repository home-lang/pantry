import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/dxc',
  name: 'dxc',
  programs: [
    'dxc',
    'dxv',
    'dxa',
    'dxr',
    'dxl',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'cmake.org': '*',
    'git-scm.org': '^2',
    'ninja-build.org': '^1',
    'python.org': '>=3.7<3.12',
  },
  distributable: {
    url: 'git+https://github.com/microsoft/DirectXShaderCompiler',
  },
  build: {
    script: [
      'git submodule update --init',
      'cmake -B $BUILD_DIR $CMAKE_ARGS',
      'ninja -C $BUILD_DIR',
      'mkdir -p {{prefix}}',
      'cp -r $BUILD_DIR/bin {{prefix}}/',
      'cp -r $BUILD_DIR/lib {{prefix}}/',
    ],
    env: {
      BUILD_DIR: '$(mktemp -d)',
      CMAKE_ARGS: [
        '-GNinja',
        '-C./cmake/caches/PredefinedParams.cmake',
        '-DSPIRV_BUILD_TESTS=ON',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
      linux: {
        LDFLAGS: '$LDFLAGS -Wl,-lstdc++fs',
      },
    },
  },
  test: {
    script: [
      'dxc --help',
    ],
  },
}
