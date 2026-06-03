import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/KhronosGroup/Vulkan-Headers',
  name: 'Vulkan-Headers',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/Vulkan-Headers/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build/ $ARGS',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}"',
        '-G Ninja',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.cpp',
      'clang++ test.cpp -o test',
      'out=$(./test)',
      'echo $out',
    ],
  },
}
