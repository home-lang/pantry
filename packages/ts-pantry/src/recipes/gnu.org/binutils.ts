import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/binutils",
  name: "binutils",
  programs: [],
  buildDependencies: {
    'gnu.org/bison': "*",
    'gnu.org/texinfo': "*",
    'facebook.com/zstd': "*",
    linux: {
      'gnu.org/gcc': "*",
      'perl.org': "~5.42",
    },
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/binutils/binutils-with-gold-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test -f zutil.h; then sed -i '/define fdopen(fd,mode) NULL/d' zutil.h; fi",
        if: "<2.29",
        'working-directory': "zlib",
      },
      {
        run: "if test -f errors.h; then sed -i -f $PROP errors.h; fi",
        if: "<2.29",
        'working-directory': "gold",
      },
      {
        run: "export ARGS=\"$ARGS --with-zstd\"",
        if: ">=2.39",
      },
      "./configure $ARGS",
      "make --jobs {{ hw.concurrency }}",
      "make install",
    ],
    env: {
      ARGS: [
        "--prefix={{ prefix }}",
        "--disable-werror",
      ],
      linux: {
        ARGS: [
          "--enable-ld=yes",
          "--enable-gold=yes",
        ],
      },
    },
  },
  test: {
    script: [
      "if test \"$(uname)\" = Darwin; then\n  printf 'int main(void) { return 0; }\\n' > test.c\n  cc -c test.c -o test.o\n  ar rcS libtest.a test.o\n  strings libtest.a | grep -s _main\n  exit 0\nfi\n",
      "objdump -x $(which objdump) | grep -s $TEST_STRING",
    ],
  },
}
