import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sqlite.org',
  name: 'sqlite3',
  description: 'Official Git mirror of the SQLite source tree',
  homepage: 'https://sqlite.org/index.html',
  github: 'https://github.com/sqlite/sqlite',
  programs: ['sqlite3'],
  versionSource: {
    type: 'github-releases',
    repo: 'sqlite/sqlite',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://sqlite.org/2022/sqlite-autoconf-{{version.major}}{{version.minor}}0{{version.patch}}00.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS --with-readline-ldflags="-L{{deps.gnu.org/readline.prefix}}/lib -lreadline"',
      'make --jobs {{ hw.concurrency }} install',
      'run: |',
    ],
  },
}
