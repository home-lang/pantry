import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/Z3Prover/z3",
  name: "z3",
  programs: [
    "z3",
  ],
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': "^3",
    'python.org': ">=3<3.12",
    linux: {
      'gnu.org/gcc': 14,
    },
  },
  distributable: {
    url: "https://github.com/Z3Prover/z3/archive/z3-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: "MACOSX_DEPLOYMENT_TARGET=13.3",
        if: ">=4.15.5",
      },
      "cmake .. $ARGS",
      "make --jobs {{hw.concurrency}} install",
    ],
    env: {
      ARGS: [
        "-DZ3_LINK_TIME_OPTIMIZATION=ON",
        "-DZ3_INCLUDE_GIT_DESCRIBE=OFF",
        "-DZ3_INCLUDE_GIT_HASH=OFF",
        "-DZ3_INSTALL_PYTHON_BINDINGS=ON",
        "-DZ3_BUILD_EXECUTABLE=ON",
        "-DZ3_BUILD_TEST_EXECUTABLES=OFF",
        "-DZ3_BUILD_PYTHON_BINDINGS=ON",
        "-DZ3_BUILD_DOTNET_BINDINGS=OFF",
        "-DZ3_BUILD_JAVA_BINDINGS=OFF",
        "-DZ3_USE_LIB_GMP=OFF",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PYTHON_PKG_DIR={{prefix}}/lib/python",
        "-DCMAKE_CXX_STANDARD=20",
      ],
    },
  },
  test: {
    script: [
      "wget https://raw.githubusercontent.com/Z3Prover/z3/z3-{{version}}/examples/c/test_capi.c",
      "cc test_capi.c -lz3",
      "if test \{{hw.platform}}+{{hw.arch}}\ != \"linux+x86-64\"; then\n  ./a.out\nfi\n",
      "if \{{hw.platform}}+{{hw.arch}}\ != \"linux+aarch\"; then\n  v=\"$(python -c 'import z3; print(z3.get_version_string())')\"\n  test \"$v\" = {{version}}\nfi\n",
    ],
  },
}
