import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/plougher/squashfs-tools",
  name: "squashfs-tools",
  programs: [
    "mksquashfs",
    "unsquashfs",
    "sqfscat",
    "sqfstar",
  ],
  dependencies: {
    'lz4.org': 1,
    'oberhumer.com/lzo': 2,
    'tukaani.org/xz': 5,
    'facebook.com/zstd': 1,
    'zlib.net': 1,
  },
  buildDependencies: {
    'curl.se': "*",
    'gnu.org/patch': "*",
  },
  distributable: {
    url: "https://github.com/plougher/squashfs-tools/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "curl 'https://github.com/plougher/squashfs-tools/commit/8b9288365fa0a0d80d8be82a3a6b42ea1c12629a.patch?full_index=1' | patch",
        if: "=4.7",
      },
      {
        run: "curl 'https://github.com/plougher/squashfs-tools/commit/f88f4a659d6ab432a57e90fe2f6191149c6b343f.patch?full_index=1' | patch",
        if: "=4.7.5",
      },
      "make $ARGS",
      "mkdir -p {{prefix}}/bin",
      "install mksquashfs unsquashfs sqfscat sqfstar {{prefix}}/bin",
    ],
    env: {
      ARGS: [
        "EXTRA_CFLAGS=-std=gnu99",
        "LZ4_SUPPORT=1",
        "LZO_SUPPORT=1",
        "XZ_SUPPORT=1",
        "LZMA_XZ_SUPPORT=1",
        "ZSTD_SUPPORT=1",
        "XATTR_SUPPORT=1",
      ],
    },
  },
  test: {
    script: [
      "mksquashfs -version | grep \"mksquashfs version {{version.raw}}\"",
      "(unsquashfs -v || true) | grep \"unsquashfs version {{version.raw}}\"",
      "echo 1 >test1\necho 2 >test2\necho 3 >test3",
      "mksquashfs in/test1 in/test2 in/test3 test.xz.sqsh -comp xz",
      "test -f test.xz.sqsh",
      "unsquashfs -s test.xz.sqsh | grep 'Found a valid SQUASHFS 4:0 superblock on test.xz.sqsh'",
      "unsquashfs -d out test.xz.sqsh",
      "test -f out/test1",
      "test -f out/test2",
      "test -f out/test3",
      "diff -r in/ out/",
    ],
  },
}
