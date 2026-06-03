import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/serf',
  name: 'serf',
  programs: [],
  dependencies: {
    'apache.org/apr': '^1',
    'apache.org/apr-util': '^1',
    'openssl.org': '^1.1',
    'zlib.net': '^1.2',
    'kerberos.org': '^1.20',
    'libexpat.github.io': '^2',
  },
  buildDependencies: {
    'python.org': '~3.11',
    'scons.org': '*',
  },
  distributable: {
    url: 'https://archive.apache.org/dist/serf/serf-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP SConstruct',
      },
      'scons $ARGS',
      'scons install',
    ],
    env: {
      ARGS: [
        'APR={{deps.apache.org/apr.prefix}}',
        'APU={{deps.apache.org/apr-util.prefix}}',
        'OPENSSL={{deps.openssl.org.prefix}}',
        'ZLIB={{deps.zlib.net.prefix}}',
        'GSSAPI={{deps.kerberos.org.prefix}}',
        'CFLAGS=-Wno-incompatible-pointer-types',
        'PREFIX={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(pkg-config --modversion serf-1)" = "{{version}}"',
    ],
  },
}
