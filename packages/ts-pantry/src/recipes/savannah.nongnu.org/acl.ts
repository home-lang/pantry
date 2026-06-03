import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'savannah.nongnu.org/acl',
  name: 'acl',
  programs: [
    'chacl',
    'getfacl',
    'setfacl',
  ],
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
    'gnu.org/libtool': '*',
    'savannah.nongnu.org/attr': '*',
  },
  distributable: {
    url: 'https://download.savannah.nongnu.org/releases/acl/acl-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make -j {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--disable-rpath',
      ],
    },
  },
  test: {
    script: [
      'getfacl --version | grep {{version.raw}}',
      'setfacl --version | grep {{version.raw}}',
      'getfacl -p $FIXTURE | grep "# file:"',
      'setfacl -m u::rwx $FIXTURE',
      'getfacl -p $FIXTURE | grep "user::rwx"',
      'setfacl -m g::r-- $FIXTURE',
      'chacl -l $FIXTURE | grep "\\[u::rwx,g::r--"',
    ],
  },
}
