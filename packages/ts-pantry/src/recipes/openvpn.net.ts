import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openvpn.net',
  name: 'openvpn',
  programs: ['openvpn'],
  platforms: ['darwin'],
  distributable: {
    url: 'https://swupdate.openvpn.org/community/releases/openvpn-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'lz4.org': '^1.9',
    'oberhumer.com/lzo': '^2.10',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--with-crypto-library=openssl', '--disable-pkcs11'],
    },
  },
}
