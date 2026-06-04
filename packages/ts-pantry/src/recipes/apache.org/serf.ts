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
        // without this, scons just throws away our painstakingly crafted environment
        run: 'sed -i -f $PROP SConstruct',
        prop: {
          content: 's/env = Environment(variables=opts,/env = Environment(ENV = os.environ, variables=opts,/',
        },
      },
      // The scons.org S3 build-dep is a python venv whose internal shebangs are
      // baked to its original build prefix; once relocated under buildkit-deps it
      // execs `../venv/bin/scons` (a dead shebang) and fails with "not found".
      // Provision a fresh, self-contained scons in a local venv and use it directly.
      {
        run: [
          'if ! scons --version >/dev/null 2>&1; then',
          '  python3 -m venv "$SRCROOT/.scons-venv"',
          '  "$SRCROOT/.scons-venv/bin/pip" install --upgrade pip >/dev/null',
          '  "$SRCROOT/.scons-venv/bin/pip" install scons >/dev/null',
          'fi',
        ],
      },
      'PATH="$SRCROOT/.scons-venv/bin:$PATH" scons $ARGS',
      'PATH="$SRCROOT/.scons-venv/bin:$PATH" scons install',
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
