import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cyrusimap.org/cyrus-sasl',
  name: 'cyrus-sasl',
  programs: [],
  buildDependencies: {
    'kerberos.org': '*',
    'openssl.org': '^1.1.1',
  },
  distributable: {
    url: 'https://github.com/cyrusimap/cyrus-sasl/releases/download/cyrus-sasl-{{version}}/cyrus-sasl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-macos-framework',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix="{{prefix}}"',
        '--with-ssl={{ deps.openssl.org.prefix }}',
      ],
      linux: {
        CFLAGS: '-Wno-implicit-function-declaration',
      },
    },
  },
  test: {
    script: [
      'cc fixture.cpp "-I{{prefix}}/include", "-L{{prefix}}/lib" -lsasl2',
      'test "$(./a.out)" = "20 SGVsbG8sIHdvcmxkIQ=="',
    ],
  },
}
