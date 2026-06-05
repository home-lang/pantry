import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/jbeder/yaml-cpp",
  name: "yaml-cpp",
  programs: [],
  buildDependencies: {
    'cmake.org': "^3",
  },
  // Most yaml-cpp releases are tagged `yaml-cpp-<version>`, but 0.8.0 is tagged
  // with a bare `<version>` (no prefix). A single distributable template can't
  // cover both, so fetch the source in-script with the correct per-version tag.
  distributable: null,
  build: {
    script: [
      {
        run: [
          'VERSION={{version}}',
          'if [ "$VERSION" = "0.8.0" ]; then TAG="$VERSION"; else TAG="yaml-cpp-$VERSION"; fi',
          'curl -Lfo src.tar.gz "https://github.com/jbeder/yaml-cpp/archive/refs/tags/${TAG}.tar.gz"',
          'tar xzf src.tar.gz --strip-components=1',
        ].join('\n'),
      },
      {
        run: "mkdir -p build && cd build && cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DYAML_BUILD_SHARED_LIBS=ON -DYAML_CPP_BUILD_TESTS=OFF -DCMAKE_BUILD_TYPE=Release && make --jobs {{hw.concurrency}} install",
        if: "<0.9",
      },
      {
        run: "mkdir -p build && cd build && cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DYAML_BUILD_SHARED_LIBS=ON -DYAML_CPP_BUILD_TESTS=OFF -DCMAKE_BUILD_TYPE=Release && cmake --build . && cmake --install .",
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
