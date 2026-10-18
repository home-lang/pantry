import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'php.net',
  name: 'php',
  description: 'General-purpose scripting language',
  homepage: 'https://www.php.net/',
  github: 'https://github.com/php/php-src',
  programs: ['phar', 'php', 'php-cgi', 'php-config', 'phpdbg', 'phpize', 'php-fpm'],
  versionSource: {
    // Stable releases only — exclude pre-releases (php-8.5.7RC1, *alpha/beta/RC*),
    // whose tarballs are NOT published at /distributions/ and 404.
    type: 'github-tags',
    repo: 'php/php-src',
    tagPattern: /^php-(\d+\.\d+\.\d+)$/,
  },
  distributable: {
    url: 'https://www.php.net/distributions/php-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/bison': '^3',
    're2c.org': '^3',
    'apache.org/apr': '^1',
    'apache.org/apr-util': '^1',
    'bcrypt.sourceforge.net': '^1',
    'gnu.org/autoconf': '^2',
    'curl.se': '^8',
    'nghttp2.org': '*',
    'gnu.org/gettext': '^0',
    'gnu.org/gmp': '^6',
    'libsodium.org': '<1.0.19',
    'libzip.org': '^1.9',
    'github.com/kkos/oniguruma': '^6',
    'openssl.org': '^3',
    'pcre.org/v2': '>=10.30',
    'sqlite.org': '^3',
    'postgresql.org': '^17', // libpq for the pgsql / pdo_pgsql extensions
    'unicode.org': '^71',
    'gnu.org/libiconv': '^1',
    'kerberos.org': '^1',
    'gnome.org/libxml2': '*',
    'thrysoee.dk/editline': '^3',
    'sourceware.org/libffi': '>=3.4.7',
    'gnome.org/libxslt': '>=1.1.0<1.1.43',
    'libpng.org': '^1',
    'google.com/webp': '^1',
    'ijg.org': '^9',
    'gnu.org/sed': '^4',
    'openldap.org': '^2',
    'gnu.org/gcc/libstdcxx': '^14',
    darwin: {
      'sourceware.org/bzip2': '^1',
      'zlib.net': '^1',
    },
  },
  buildDependencies: {
    'freetype.org': '*',
    'gnu.org/libtool': '*',
    darwin: {
      'tukaani.org/xz': '*',
    },
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      {
        run: [
          'sed -i -e\'s|{{prefix}}|${prefix}|g\' -e\'s|^prefix=.*|prefix="$(dirname "$(dirname "$0")")"|\' -e\'s|^SED=.*|SED=sed|\' php-config phpize',
          'sed -i \'1s|^#!.*|#!/usr/bin/env php|\' phar',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      'CPP': 'clang -E',
      'ARGS': ['--prefix={{prefix}}', '--disable-rpath', '--enable-bcmath', '--enable-calendar', '--enable-dba', '--enable-exif', '--enable-ftp', '--enable-fpm', '--enable-gd', '--enable-intl', '--enable-mbregex', '--enable-mbstring', '--enable-mysqlnd', '--enable-pcntl', '--enable-phpdbg', '--enable-phpdbg-readline', '--enable-shmop', '--enable-soap', '--enable-sockets', '--enable-sysvmsg', '--enable-sysvsem', '--enable-sysvshm', '--without-pear', '--with-curl', '--with-external-pcre', '--with-ffi', '--with-gettext={{deps.gnu.org/gettext.prefix}}', '--with-gmp={{deps.gnu.org/gmp.prefix}}', '--with-iconv={{deps.gnu.org/libiconv.prefix}}', '--with-kerberos', '--with-layout=GNU', '--with-libxml', '--with-libedit', '--with-openssl', '--with-pdo-sqlite', '--with-pgsql={{deps.postgresql.org.prefix}}', '--with-pdo-pgsql={{deps.postgresql.org.prefix}}', '--with-pdo-mysql=mysqlnd', '--with-mysqli=mysqlnd', '--with-pic', '--with-sodium', '--with-sqlite3', '--with-xsl', '--with-zip', '--with-zlib', '--disable-dtrace', '--without-ldap-sasl', '--without-ndbm', '--without-gdbm'],
      'darwin': {
        CC: 'clang',
        CXX: 'clang++',
        LD: '/usr/bin/ld',
        // Preserve space for normal relocation and PHP's native resolver symbols.
        LDFLAGS: '-Wl,-headerpad_max_install_names -lresolv',
        ARGS: ['--enable-dtrace', '--with-ldap-sasl'],
      },
    },
  },
  test: {
    required: true,
    script: [
      'test "$(php-config --version)" = "{{version}}"',
      'php -r \'if (PHP_VERSION !== "{{version}}") exit(1);\'',
      'php -r \'foreach (["bcmath", "curl", "ffi", "gd", "intl", "mbstring", "mysqli", "pdo_mysql", "pdo_pgsql", "pdo_sqlite", "pgsql", "Phar", "sodium", "sqlite3", "zip"] as $module) { if (!extension_loaded($module)) { fwrite(STDERR, "Missing extension: $module\\n"); exit(1); } }\'',
      'phar help > /dev/null',
      '{{prefix}}/sbin/php-fpm -v | grep -F "{{version}}"',
    ],
  },
}
