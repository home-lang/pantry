import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/DaanDeMeyer/reproc",
  name: "reproc",
  programs: [],
  buildDependencies: {
    'cmake.org': "^3",
  },
  distributable: {
    url: "https://github.com/DaanDeMeyer/reproc/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      "cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DREPROC++=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_BUILD_TYPE=Release",
      "make --jobs {{hw.concurrency}} install",
    ],
  },
  test: {
    script: [
      "mv $FIXTURE b.c\ncc b.c -lreproc\nout=\"$(./a.out)\"\ntest \"$out\" = \"Hello, world!\"\n",
      "mv $FIXTURE b.cpp\nc++ b.cpp -lreproc++ -std=c++11\nout=\"$(./a.out)\"\ntest \"$out\" = \"Hello, world!\"\n",
    ],
  },
}
