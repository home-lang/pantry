import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "x.org/applewm",
  name: "applewm",
  programs: [],
  dependencies: {
    'x.org/x11': "*",
    'x.org/exts': "*",
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': "*",
  },
  distributable: {
    url: "https://www.x.org/releases/individual/lib/libAppleWM-{{version}}.tar.bz2",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak \"s|-F|-iframeworkwithsysroot|g\" src/Makefile.in\nrm -f src/Makefile.in.bak\n",
        if: "1.4.1",
      },
      "./configure $CONFIGURE_ARGS",
      "make --jobs {{ hw.concurrency }}",
      "make --jobs {{ hw.concurrency }} install",
    ],
    env: {
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\{{prefix}}\",
        "--libdir=\{{prefix}}/lib\",
      ],
    },
  },
  test: {
    script: [
      "pkg-config --modversion applewm | grep {{version}}",
      "cc test.c -lX11 -lAppleWM -o test",
      "./test",
    ],
  },
}
