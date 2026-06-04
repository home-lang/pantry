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
    'x.org/util-macros': "*",
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'gnu.org/libtool': "*",
  },
  // www.x.org/releases tarballs were retired (404); the freedesktop GitLab
  // mirror ships the raw sources (no pre-built configure), so bootstrap with
  // autogen.sh. libAppleWM has no meson.build, so autotools is required.
  distributable: {
    url: "https://gitlab.freedesktop.org/xorg/lib/libapplewm/-/archive/libAppleWM-{{version}}/libapplewm-libAppleWM-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "NOCONFIGURE=1 ./autogen.sh",
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
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
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
