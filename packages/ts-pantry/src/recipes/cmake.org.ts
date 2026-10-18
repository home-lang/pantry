import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cmake.org',
  name: 'cmake',
  description: 'Mirror of CMake upstream repository',
  homepage: 'https://www.cmake.org/',
  github: 'https://github.com/Kitware/CMake',
  programs: ['cmake', 'ccmake', 'cpack', 'ctest'],
  versionSource: {
    type: 'github-releases',
    repo: 'Kitware/CMake',
  },
  distributable: {
    url: 'https://github.com/Kitware/CMake/releases/download/v{{version}}/cmake-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '1',
    'sourceware.org/bzip2': '1',
    'curl.se': '^8',
    'invisible-island.net/ncurses': '^6',
    linux: { 'gnu.org/gcc/libstdcxx': '14' },
  },
  buildDependencies: { 'gnu.org/make': '*', 'freedesktop.org/pkg-config': '*' },

  build: {
    script: [
      './bootstrap $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'rm -rf {{prefix}}/share/doc  # docs are online',
    ],
    env: {
      'V': '1',
      'ARGS': ['--prefix={{prefix}}', '--parallel={{hw.concurrency}}', '--datadir=share/cmake-{{version.marketing}}', '--docdir=share/doc/cmake', '--mandir=share/man', '--system-zlib', '--system-curl', '--', '-DBUILD_CursesDialog=ON', '-DCURSES_NEED_WIDE=ON', '-DCMAKE_VERBOSE_MAKEFILE:BOOL=ON'],
    },
  },
  test: {
    required: true,
    script: [
      'cmake --version | grep -F "{{version}}"',
      'ccmake --version | grep -F "{{version}}"',
      'printf "cmake_minimum_required(VERSION 3.20)\\nproject(PantryCMakeCheck C)\\nenable_testing()\\nadd_executable(probe probe.c)\\nadd_test(NAME probe COMMAND probe)\\n" > CMakeLists.txt',
      'printf "int main(void) { return 0; }\\n" > probe.c',
      'cp -a "{{prefix}}" relocated',
      'relocated/bin/cmake -S . -B project-build',
      'relocated/bin/cmake --build project-build',
      'relocated/bin/ctest --test-dir project-build --output-on-failure',
    ],
  },
}
