import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/moretension/duti",
  name: "duti",
  programs: [
    "duti",
  ],
  buildDependencies: {
    'gnu.org/autoconf': "*",
  },
  distributable: {
    url: "https://github.com/moretension/duti/archive/refs/tags/duti-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "curl -L https://github.com/moretension/duti/commit/825b5e6a92770611b000ebdd6e3d3ef8f47f1c47.patch?full_index=1 | patch -p1 # 10.14\ncurl -L https://github.com/moretension/duti/commit/4a1f54faf29af4f125134aef3a47cfe05c7755ff.patch?full_index=1 | patch -p1 # 10.15\ncurl -L https://github.com/moretension/duti/commit/ec195e261f8a48a1a18e262a2b1f0ef26a0bc1ee.patch?full_index=1 | patch -p1 # 12\ncurl -L https://github.com/moretension/duti/commit/54a1539b23ac764b32679bcada5659fbad483ecc.patch?full_index=1 | patch -p1 # 13\ncurl -L https://github.com/moretension/duti/commit/8d31a2f75fefb61381dc7731cf7ecac9237ee64d.patch?full_index=1 | patch -p1\n",
        if: "<=1.5.4",
      },
      "autoreconf -i",
      "./configure $ARGS",
      "make",
      "make --jobs {{ hw.concurrency }} install",
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
      ],
    },
  },
  test: {
    script: [
      "duti -l public.text | grep com.apple.TextEdit",
    ],
  },
}
