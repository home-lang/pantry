import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thkukuk/libnsl',
  name: 'libnsl',
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
      // libtirpc installs its headers under <prefix>/include/tirpc, so a bare
      // -I<prefix>/include resolves <tirpc/rpc/rpc.h> but not the <rpc/rpc.h>
      // that libnsl's sources include. Point CPPFLAGS/PKG_CONFIG at libtirpc
      // explicitly so configure's PKG_CHECK_MODULES and the compile both find it.
      'export PKG_CONFIG_PATH="{{deps.sourceforge.net/libtirpc.prefix}}/lib/pkgconfig:${PKG_CONFIG_PATH:-}"',
      'export CPPFLAGS="-I{{deps.sourceforge.net/libtirpc.prefix}}/include/tirpc ${CPPFLAGS:-}"',
      'export LDFLAGS="-L{{deps.sourceforge.net/libtirpc.prefix}}/lib ${LDFLAGS:-}"',
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
