import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/KhronosGroup/Vulkan-Loader',
  name: 'Vulkan-Loader',
  programs: [],
  dependencies: {
    'github.com/KhronosGroup/Vulkan-Headers': '*',
    linux: {
      'x.org/x11': '*',
      'x.org/xcb': '*',
      'wayland.freedesktop.org': '*',
    },
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'cmake.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
    linux: {
      'x.org/xrandr': '*',
    },
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/Vulkan-Loader/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DVULKAN_HEADERS_INSTALL_DIR={{deps.github.com/KhronosGroup/Vulkan-Headers.prefix}}',
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test -lvulkan',
      './test',
    ],
  },
}
