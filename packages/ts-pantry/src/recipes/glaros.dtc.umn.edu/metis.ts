import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "glaros.dtc.umn.edu/metis",
  name: "metis",
  programs: [
    "cmpfillin",
    "gpmetis",
    "graphchk",
    "m2gmetis",
    "mpmetis",
    "ndmetis",
  ],
  buildDependencies: {
    'gnu.org/make': "*",
    'cmake.org': "*",
    'git-scm.org': "*",
  },
  distributable: {
    url: "git+https://github.com/scivision/METIS",
  },
  build: {
    script: [
      "cmake -B build $ARGS",
      "cmake --build build --parallel",
      "cmake --install build",
      {
        // The scivision/METIS mirror does not ship the example graphs/ tree,
        // so only copy them when present (a bare glob would expand to itself
        // and break `mv` with "usage: mv ...").
        run: "if ls ./src/graphs/* >/dev/null 2>&1; then mkdir -p {{prefix}}/pkgshare/graphs; mv ./src/graphs/* {{prefix}}/pkgshare/graphs/; fi\n",
        if: "<5.2",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_INSTALL_LIBDIR={{prefix}}/lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
      ],
    },
  },
  test: {
    script: [
      "curl -LO 'https://raw.githubusercontent.com/KarypisLab/METIS/v5.1.1-DistDGL-v0.5/graphs/4elt.graph'",
      "graphchk 4elt.graph",
      "gpmetis 4elt.graph 2",
      "ndmetis 4elt.graph",
    ],
  },
}
