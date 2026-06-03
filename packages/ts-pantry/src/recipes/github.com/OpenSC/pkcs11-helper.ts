import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/OpenSC/pkcs11-helper',
  name: 'pkcs11-helper',
  programs: [],
  dependencies: {
    'openssl.org': '^3.1.0',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/OpenSC/pkcs11-helper/releases/download/pkcs11-helper-{{version}}/pkcs11-helper-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf --verbose --install --force',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion libpkcs11-helper-{{version.major}} | grep {{version}}',
      'cc ./test.c -lpkcs11-helper -o test',
      './test',
    ],
  },
}
