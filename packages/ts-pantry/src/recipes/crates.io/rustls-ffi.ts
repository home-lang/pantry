import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/rustls-ffi",
  name: "rustls-ffi",
  programs: [],
  buildDependencies: {
    'rust-lang.org': "^1.65",
    'rust-lang.org/cargo': "*",
    'mozilla.org/cbindgen': "*",
    'github.com/lu-zero/cargo-c': "*",
  },
  distributable: {
    url: "https://codeload.github.com/rustls/rustls-ffi/tar.gz/refs/tags/{{version.tag}}",
    stripComponents: 1,
  },
  build: {
    script: [
      "make DESTDIR={{prefix}}",
      "make DESTDIR={{prefix}} install",
    ],
    env: {
      linux: {
        AWS_LC_SYS_CFLAGS: "-Wno-unused-command-line-argument",
      },
    },
  },
  test: {
    script: [
      "URL=\"https://raw.githubusercontent.com/rustls/rustls-ffi/{{ version.tag }}/tests\"",
      "URL=\"https://raw.githubusercontent.com/rustls/rustls-ffi/{{ version.tag }}/librustls/tests\"",
      "for file in $TESTFILES; do\n  curl -O $URL/$file\ndone\n",
      "cc client.c common.c -o client $ARGS",
      "./client pkgx.dev 443 /",
    ],
  },
}
