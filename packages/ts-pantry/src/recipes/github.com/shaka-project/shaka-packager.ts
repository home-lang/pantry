import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/shaka-project/shaka-packager',
  name: 'shaka-packager',
  programs: [
    'packager',
    'mpd_generator',
  ],
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': '*',
    },
  },
  buildDependencies: {
    'ninja-build.org': '*',
    'cmake.org': '^3',
    'python.org': '^3.10',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'git+https://github.com/shaka-project/shaka-packager.git',
  },
  build: {
    script: [
      'git submodule update --init --recursive',
      'cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release',
      'cmake --build build --parallel',
      'cmake --install build/ --strip --config Release --prefix={{prefix}}',
    ],
  },
}
