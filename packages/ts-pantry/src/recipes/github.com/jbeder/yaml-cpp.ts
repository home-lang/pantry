import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/jbeder/yaml-cpp",
  name: "yaml-cpp",
  programs: [],
  buildDependencies: {
    'cmake.org': "^3",
  },
  distributable: {
    url: "https://github.com/jbeder/yaml-cpp/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DYAML_BUILD_SHARED_LIBS=ON -DYAML_CPP_BUILD_TESTS=OFF -DCMAKE_BUILD_TYPE=Release",
      {
        run: "make --jobs {{hw.concurrency}} install",
        if: "<0.9",
      },
      {
        run: "cmake --build .\ncmake --install .",
        if: ">=0.9",
      },
    ],
  },
  test: {
    script: [
      "c++ -std=c++11 -lyaml-cpp $FIXTURE",
      "./a.out",
    ],
  },
}
