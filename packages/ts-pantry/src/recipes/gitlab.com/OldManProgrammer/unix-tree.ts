import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gitlab.com/OldManProgrammer/unix-tree',
  name: 'unix-tree',
  programs: [
    'tree',
  ],
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://gitlab.com/OldManProgrammer/unix-tree/-/archive/{{version}}/unix-tree-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'/secontext/d\' tree.c',
        if: 'darwin',
      },
      'make',
      'make $ARGS install',
    ],
    env: {
      ARGS: [
        'PREFIX={{prefix}}',
      ],
      LDFLAGS: [
        '-s',
      ],
      linux: {
        CC: 'gcc',
        CFLAGS: '-O3',
      },
      darwin: {
        CC: 'cc',
        CFLAGS: '-O2 -Wall -fomit-frame-pointer -no-cpp-precomp',
      },
    },
  },
  test: {
    script: [
      'mkdir -p foo/bar',
      'mkdir -p foo/buzz',
      'touch foo/buzz/lupus.txt',
      'tree --version | grep \'tree v{{version}}\'',
      'out="$(tree . )"',
      'echo $out | grep lupus.txt',
      'echo $out | grep bar',
      'echo $out | grep buzz',
      'echo $out | grep \'4 directories, 1 file\'',
      'tree .',
    ],
  },
}
