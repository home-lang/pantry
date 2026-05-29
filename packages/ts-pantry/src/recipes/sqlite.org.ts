import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sqlite.org',
  name: 'sqlite3',
  description: 'Official Git mirror of the SQLite source tree',
  homepage: 'https://sqlite.org/index.html',
  github: 'https://github.com/sqlite/sqlite',
  programs: ['sqlite3'],
  versionSource: {
    type: 'github-tags',
    repo: 'sqlite/sqlite',
    tagPattern: /^version-(.+)$/,
  },
  dependencies: {
    'zlib.net': '1',
    'gnu.org/readline': '8',
  },
  buildDependencies: {
    linux: {
      'nixos.org/patchelf': '*',
    },
  },
  distributable: {
    // Year-based path: current/recent autoconf tarballs live under /2026/.
    // Filename encodes version 3.MM.PP as 3 MM 0 PP 00 (e.g. 3.53.1 -> 3530100).
    url: 'https://sqlite.org/2026/sqlite-autoconf-{{version.major}}{{version.minor}}0{{version.patch}}00.tar.gz',
    stripComponents: 1,
  },

  build: {
    env: {
      linux: {
        SUFFIX: 'so',
      },
      darwin: {
        SUFFIX: 'dylib',
      },
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-readline',
        '--disable-editline',
        '--enable-session',
        '--with-readline-cflags=-I{{deps.gnu.org/readline.prefix}}/include',
      ],
      CPPFLAGS: [
        // copied without explanation from brew
        '-DSQLITE_ENABLE_COLUMN_METADATA=1',
        '-DSQLITE_ENABLE_RTREE=1',
        '-DSQLITE_ENABLE_FTS3=1 -DSQLITE_ENABLE_FTS3_PARENTHESIS=1',
        '-DSQLITE_ENABLE_JSON1=1',
        // Default value of MAX_VARIABLE_NUMBER is 999 which is too low for many
        // applications. Set to 250000 (same value used in Debian and Ubuntu).
        '-DSQLITE_MAX_VARIABLE_NUMBER=250000',
      ],
    },
    script: [
      './configure $ARGS --with-readline-ldflags="-L{{deps.gnu.org/readline.prefix}}/lib -lreadline"',
      'make --jobs {{hw.concurrency}} install',
      {
        run: [
          'if [ ! -f libsqlite3.$SUFFIX ]; then',
          '  ln -s libsqlite3.0.$SUFFIX libsqlite3.$SUFFIX',
          'fi',
        ],
        'working-directory': '{{prefix}}/lib',
      },
      // missing SONAMEs are causing path linkages from ninja. go figure.
      {
        run: 'patchelf --set-soname libsqlite3.so libsqlite3.so',
        'working-directory': '{{prefix}}/lib',
        if: 'linux',
      },
    ],
  },
}
