import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/util-linux/util-linux",
  name: "util-linux",
  propsDir: "../../../props/github.com/util-linux/util-linux",
  programs: [],
  dependencies: {
    'gnu.org/gettext': "^0",
    'sqlite.org': "^3",
  },
  buildDependencies: {
    'gnu.org/bison': "*",
    'gnu.org/patch': "*",
    darwin: {
      'llvm.org': "*",
    },
    linux: {
      'linux-pam.org': "*",
    },
  },
  distributable: {
    url: "https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/v{{version.marketing}}/util-linux-{{version.raw}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test darwin = {{hw.platform}}; then\n  patch -p0 <props/macports.patch\nfi\n",
        if: "<2.39",
      },
      {
        run: "if test darwin = {{hw.platform}}; then\n  echo '/* pidfd is Linux-only */' > lib/pidfd-utils.c\nfi\n",
        if: ">=2.42",
      },
      "sed -i 's/build_waitpid=yes ;;/build_waitpid=no ;;/g' configure",
      {
        run: "if test darwin = {{hw.platform}}; then\n  sed -i -f $PROP configure\nfi\n",
        prop: "s/build_bits=yes/build_bits=no/\ns/enable_bits=yes/enable_bits=no/\n",
        if: ">=2.41",
      },
      "./configure $ARGS",
      "make --jobs {{hw.concurrency}} install",
      {
        run: "for x in $HEADERS; do\n  if test -f \"$x/$x.h\"; then\n    mv \"$x/$x.h\" .\n    ln -s \"../$x.h\" \"$x/\"\n  fi\ndone\n",
        'working-directory': "{{prefix}}/include",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-makeinstall-chown",
        "--disable-makeinstall-setuid",
        "--disable-liblastlog2",
      ],
      HEADERS: [
        "blkid",
        "libfdisk",
        "libsmartcols",
        "uuid",
      ],
      darwin: {
        ARGS: [
          "--disable-pam-lastlog2",
          "--disable-libuuid",
        ],
      },
      linux: {
        HEADERS: [
          "libmount",
        ],
        CFLAGS: "$CFLAGS -Wl,--undefined-version",
      },
    },
  },
  test: {
    script: [
      "test \"$(echo 5 6 7 | column -tJN first,second,third | jq .table[0].second)\" = '\"6\"'",
    ],
  },
}
