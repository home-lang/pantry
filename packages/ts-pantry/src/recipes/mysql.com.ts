import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mysql.com',
  name: 'mysql',
  description: 'MySQL Server, the world\\s most popular open source database, and MySQL Cluster, a real-time, open source transactional database.',
  homepage: 'https://www.mysql.com/',
  github: 'https://github.com/mysql/mysql-server',
  programs: ['mysql_client_test', 'my_print_defaults', 'myisam_ftdump', 'myisamchk', 'myisamlog', 'myisampack', 'mysql', 'mysql_config', 'mysql_config_editor', 'mysql_keyring_encryption_test', 'mysql_migrate_keyring', 'mysql_secure_installation', 'mysql_tzinfo_to_sql', 'mysqladmin', 'mysqlbinlog', 'mysqlcheck', 'mysqld', 'mysqld_multi', 'mysqld_safe', 'mysqldump', 'mysqldumpslow', 'mysqlimport', 'mysqlrouter', 'mysqlrouter_keyring', 'mysqlrouter_passwd', 'mysqlrouter_plugin_info', 'mysqlshow', 'mysqlslap', 'mysqltest', 'mysqltest_safe_process', 'mysqlxtest'],
  versionSource: {
    type: 'github-releases',
    repo: 'mysql/mysql-server',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://cdn.mysql.com/Downloads/MySQL-{{version.marketing}}/mysql-boost-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'sed -i -e \\s/\\(STRING_APPEND.*moutline-atomics.*\\)/# \\1/\\ ../CMakeLists.txt',
      'run: export ARGS="$(echo $ARGS | sed \\s/WITH_ZLIB=system/WITH_ZLIB=bundled/g\\)"',
      'run: export ARGS="$ARGS -DCMAKE_C_STANDARD=17"',
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'mkdir -p mysql tmp',
      'mysqld --no-defaults --initialize-insecure --user=$USER --datadir=$PWD/mysql --tmpdir=$PWD/tmp',
      'PORT=$(pkgx get-port | tail -n1)',
      'mysqld --no-defaults --user=$USER --datadir=$PWD/mysql --port=$PORT --tmpdir=$PWD/tmp &',
      'sleep 5',
      'mysql --port=$PORT --user=root --password= --execute=\\show databases;\\',
      'mysqladmin --port=$PORT --user=root --password= shutdown',
    ],
  },
}
