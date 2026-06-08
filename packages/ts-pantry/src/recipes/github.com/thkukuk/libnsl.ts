import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thkukuk/libnsl',
  name: 'libnsl',
  // libnsl is the NIS/NSS (Name Service Switch) glibc companion library; it is
  // Linux-only (depends on glibc internals and libtirpc). pkgx restricts it to
  // linux — building on darwin fails. Mirror that restriction.
  platforms: ['linux'],
  programs: [],
  dependencies: {
    'sourceforge.net/libtirpc': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'gnu.org/gcc': '*',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/thkukuk/libnsl/releases/download/v{{version}}/libnsl-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      // libnsl's configure.ac uses PKG_CHECK_MODULES([TIRPC],[libtirpc]) and
      // its src/Makefile.am compiles with @TIRPC_CFLAGS@/@TIRPC_LIBS@, so the
      // whole build hinges on pkg-config locating libtirpc. libtirpc installs
      // libtirpc.pc under <prefix>/lib/pkgconfig (or lib64 on some hosts) and
      // ships its headers under <prefix>/include/tirpc. Point PKG_CONFIG_PATH at
      // both candidate dirs, and add an explicit -I<prefix>/include/tirpc /
      // -L<prefix>/lib as a belt-and-suspenders fallback for the bare
      // <rpc/rpc.h> includes in libnsl's sources in case pkg-config is unavailable.
      'export PKG_CONFIG_PATH="{{deps.sourceforge.net/libtirpc.prefix}}/lib/pkgconfig:{{deps.sourceforge.net/libtirpc.prefix}}/lib64/pkgconfig:${PKG_CONFIG_PATH:-}"',
      'export CPPFLAGS="-I{{deps.sourceforge.net/libtirpc.prefix}}/include/tirpc ${CPPFLAGS:-}"',
      'export LDFLAGS="-L{{deps.sourceforge.net/libtirpc.prefix}}/lib ${LDFLAGS:-}"',
      'export LD_LIBRARY_PATH="{{deps.sourceforge.net/libtirpc.prefix}}/lib:${LD_LIBRARY_PATH:-}"',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'gcc test.c -lnsl -o test',
      './test | grep domain',
    ],
  },
}
