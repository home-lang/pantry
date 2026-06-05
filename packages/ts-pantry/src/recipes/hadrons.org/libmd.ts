import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hadrons.org/libmd',
  name: 'libmd',
  programs: [],
  // patch-symbol-alias.diff disables __attribute__((alias)) on __APPLE__ so
  // libmd <1.1 compiles on macOS; carried from pkgx as a sibling props file.
  propsDir: '../props/hadrons.org/libmd',
  buildDependencies: {
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://archive.hadrons.org/software/libmd/libmd-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'patch -p1 <props/patch-symbol-alias.diff',
        if: '<1.1',
      },
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
  test: {
    script: [
      'cc $FIXTURE -lmd -o test',
      'test $(./test) = "900150983cd24fb0d6963f7d28e17f72"',
    ],
  },
}
