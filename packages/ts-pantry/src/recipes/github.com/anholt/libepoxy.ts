import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/anholt/libepoxy",
  name: "libepoxy",
  programs: [],
  dependencies: {
    linux: {
      'x.org/x11': "*",
      'mesa3d.org': "*",
    },
  },
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    'freedesktop.org/pkg-config': "*",
    'python.org': ">=3.1<3.12",
    linux: {
      'freeglut.sourceforge.io': "*",
    },
  },
  distributable: {
    url: "https://github.com/anholt/libepoxy/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "meson setup $ARGS ..",
      "ninja",
      "ninja install",
      {
        run: "sed -i.bak \"s|Requires.private: x11, |Requires.private: x11|g\" epoxy.pc\nrm -f epoxy.pc.bak\n",
        if: "darwin",
        'working-directory': "{{prefix}}/lib/pkgconfig",
      },
    ],
    env: {
      ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--libdir=\"{{prefix}}/lib\"",
        "--buildtype=release",
        "--wrap-mode=nofallback",
      ],
    },
  },
  test: {
    script: [
      "pkg-config --modversion epoxy | grep {{version}}",
      "cc test.c $ARGS",
      "ls -lh test",
      "./test",
    ],
  },
}
