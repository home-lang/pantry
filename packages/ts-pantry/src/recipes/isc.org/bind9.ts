import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "isc.org/bind9",
  name: "bind9",
  programs: [
    "arpaname",
    "delv",
    "dig",
    "dnssec-cds",
    "dnssec-dsfromkey",
    "dnssec-importkey",
    "dnssec-keyfromlabel",
    "dnssec-keygen",
    "dnssec-revoke",
    "dnssec-settime",
    "dnssec-signzone",
    "dnssec-verify",
    "host",
    "mdig",
    "named-checkconf",
    "named-checkzone",
    "named-compilezone",
    "named-journalprint",
    "named-rrchecker",
    "nsec3hash",
    "nslookup",
    "nsupdate",
    "ddns-confgen",
    "named",
    "rndc",
    "rndc-confgen",
    "tsig-keygen",
  ],
  dependencies: {
    'gnome.org/libxml2': '2.13',
    'nghttp2.org': '1.57',
    'libuv.org': '1.49',
    'liburcu.org': '0.15',
    'openldap.org/liblmdb': '0.9',
    'openssl.org': '1.1',
    'gnu.org/readline': '8.2',
    'github.com/json-c/json-c': '0.18',
    'gnu.org/libidn2': '2.3',
    'jemalloc.net': '5',
    linux: {
      'kernel.org/libcap': "*",
    },
  },
  buildDependencies: {
    'mesonbuild.com': '1',
    'cmake.org': '3',
    'ninja-build.org': "*",
    linux: {
      'nixos.org/patchelf': "*",
    },
  },
  distributable: {
    url: "https://downloads.isc.org/isc/bind9/{{version}}/bind-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $ARGS\nmake --jobs {{ hw.concurrency }} install",
        if: "<9.21.10",
      },
      {
        run: "meson setup build $MESON_ARGS\nmeson compile -C build -j4\nmeson install -C build",
        if: ">=9.21.10",
      },
      {
        run: "for BIN in bin/* sbin/* lib/*.so*; do\npatchelf --replace-needed {{deps.openldap.org/liblmdb.prefix}}/lib/pkgconfig/../../lib/liblmdb.so liblmdb.so $BIN\nldd $BIN | grep liblmdb || true\ndone",
        if: "linux",
        'working-directory': "${{prefix}}",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--with-json-c",
        "--with-libidn2={{deps.gnu.org/libidn2.prefix}}",
        "--with-openssl={{deps.openssl.org.prefix}}",
        "--with-lmdb={{deps.openldap.org/liblmdb.prefix}}",
      ],
      MESON_ARGS: [
        "--prefix={{prefix}}",
      ],
      darwin: {
        MESON_ARGS: [
          "-Dnamed-lto=disabled",
        ],
        MACOSX_DEPLOYMENT_TARGET: '14',
      },
    },
  },
  test: {
    script: [
      "named -V",
      "named -V | grep 'BIND {{version}}'",
      "dig pkgx.sh",
    ],
  },
}
