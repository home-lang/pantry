import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'abseil.io',
  name: 'abseil',
  description: 'Abseil Common Libraries (C++)',
  homepage: 'https://abseil.io',
  github: 'https://github.com/abseil/abseil-cpp',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'abseil/abseil-cpp',
  },
  distributable: {
    url: 'https://github.com/abseil/abseil-cpp/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'cd "${{prefix}}/lib/pkgconfig"',
      'sed -i \'s/-Xarch_x86_64 -Xarch_x86_64 -Xarch_arm64 //g\' *.pc',
      'cd "{{prefix}}/lib/cmake/absl"',
      'sed -i -e "s:{{pkgx.prefix}}:\\$\\{CMAKE_CURRENT_LIST_DIR\\}/../../../../..:g" -e "s/\\+brewing//g" abslTargets{,-release}.cmake',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_CXX_STANDARD=17', '-DBUILD_SHARED_LIBS=ON', '-DCMAKE_INSTALL_RPATH={{prefix}}/lib', '-DCMAKE_BINARY_DIR={{prefix}}/bin', '-DABSL_PROPAGATE_CXX_STD=ON', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR={{prefix}}/lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
