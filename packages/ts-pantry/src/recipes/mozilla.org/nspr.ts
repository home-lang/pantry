import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "mozilla.org/nspr",
  name: "nspr",
  programs: [
    "nspr-config",
  ],
  distributable: {
    url: "https://archive.mozilla.org/pub/nspr/releases/v{{version}}/src/nspr-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak 's|@executable_path|{{prefix}}/lib|g' configure\nrm configure.bak\n",
        if: "darwin",
        'working-directory': "nspr",
      },
      "./nspr/configure $ARGS",
      "make --jobs {{ hw.concurrency }}",
      "make --jobs {{ hw.concurrency }} install",
    ],
    env: {
      ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--disable-debug",
        "--enable-strip",
        "--with-pthreads",
        "--enable-ipv6",
        "--enable-64bit",
      ],
      darwin: {
        ARGS: [
          "--enable-macos-target=$(sw_vers -productVersion)",
        ],
      },
    },
  },
  test: {
    script: [
      "nspr-config --version | grep {{version}}",
    ],
  },
}
