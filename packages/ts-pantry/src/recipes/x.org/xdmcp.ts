import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "x.org/xdmcp",
  name: "xdmcp",
  programs: [],
  dependencies: {
    'x.org/protocol': "*",
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': "~0.29",
  },
  distributable: {
    url: "https://www.x.org/archive/individual/lib/libXdmcp-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure \\\n  --prefix=\{{prefix}}\ \\\n  --sysconfdir=\"$SHELF\"/etc \\\n  --localstatedir=\"$SHELF\"/var\n",
      "make --jobs {{ hw.concurrency }} install",
      {
        run: "sed -i 's/\\+brewing//g' *.la",
        'working-directory': "${{prefix}}/lib",
      },
    ],
    env: {
      SHELF: "${{pkgx.prefix}}/x.org",
    },
  },
  test: {
    script: [
      "mv $FIXTURE test.c",
      "cc test.c",
      "./a.out",
    ],
  },
}
