import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'php.net',
  name: 'php',
  description: 'General-purpose scripting language',
  homepage: 'https://www.php.net/',
  github: 'https://github.com/php/php-src',
  programs: ['pear', 'pecl', 'phar', 'php', 'php-cgi', 'php-config', 'phpdbg', 'phpize'],
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
    'openssl.org': '*',
    'pcre.org/v2': '>=10.30',
    'sqlite.org': '^3',
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
      // this is annoying. install-pear-nozlib.phar relies on finding /usr/bin/cpp.
      // and editing the archive messes with the offsets
      {
        run: [
          'if command -v sudo >/dev/null; then',
          '  SUDO=sudo',
          'fi',
        ].join('\n'),
        if: 'linux',
      },
      {
        run: [
          'if [ ! -f /usr/bin/cpp ]; then',
          '  $SUDO ln -s "{{deps.gnu.org/gcc.prefix}}/bin/cpp" /usr/bin/cpp',
          '  FAKE_CPP=1',
          'fi',
        ].join('\n'),
        if: 'linux',
      },
      './configure $ARGS',
      'make install',
      // clean up our fake /usr/bin/cpp
      {
        run: [
          'if [ -n "$FAKE_CPP" ]; then',
          '  $SUDO rm /usr/bin/cpp',
          'fi',
        ].join('\n'),
        if: 'linux',
      },
      {
        run: [
          'sed -i -e\'s|^prefix=.*|prefix="$(dirname "$(dirname "$0")")"|g\' -e\'s|^datarootdir=.*|datarootdir="${prefix}/share"|g\' -e\'s|^ini_path=.*|ini_path="${prefix}/etc"|g\' -e\'s|^extension_dir=\'\\\'\'{{prefix}}\\(.*\\)\'\\\'\'|extension_dir="${prefix}\\1"|g\' -e\'s|^SED=.*|SED="$(dirname "$(dirname "$(dirname "$(dirname "$0")")")")/gnu.org/sed/v4/bin/sed"|g\' -e\'s|#{{prefix}}#|#$(dirname "$(dirname "$0")")#|g\' -e\'s|{{pkgx.prefix}}|${prefix}/../..|g\' php-config phpize',
          'fix-shebangs.ts "{{prefix}}/bin/phar"',
          'sed -i -e\'s|{{prefix}}|$(dirname "$(dirname "$0")")|g\' pear peardev pecl',
        ],
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--enable-bcmath', '--enable-calendar', '--enable-dba', '--enable-exif', '--enable-ftp', '--enable-fpm', '--enable-gd', '--enable-intl', '--enable-mbregex', '--enable-mbstring', '--enable-mysqlnd', '--enable-pcntl', '--enable-phpdbg', '--enable-phpdbg-readline', '--enable-shmop', '--enable-soap', '--enable-sockets', '--enable-sysvmsg', '--enable-sysvsem', '--enable-sysvshm', '--with-pear', '--with-curl', '--with-external-pcre', '--with-ffi', '--with-gettext={{deps.gnu.org/gettext.prefix}}', '--with-gmp={{deps.gnu.org/gmp.prefix}}', '--with-iconv={{deps.gnu.org/libiconv.prefix}}', '--with-kerberos', '--with-layout=GNU', '--with-libxml', '--with-libedit', '--with-openssl', '--with-pdo-sqlite', '--with-pic', '--with-sodium', '--with-sqlite3', '--with-xsl', '--with-zlib', '--disable-dtrace', '--without-ldap-sasl', '--without-ndbm', '--without-gdbm', 'CC=gcc'],
      'linux': {
        LDFLAGS: '-Wl,-rpath,{{pkgx.prefix}}',
      },
      'darwin': {
        CC: 'clang',
        CXX: 'clang++',
        LD: '/usr/bin/ld',
        // ... we need to link with headerpad...
        // -lresolv: php's ext/standard DNS code (dns_get_record etc.) uses the
        // macOS res_9_* resolver functions, which live in libresolv; php's
        // configure doesn't always add it, so link it explicitly.
        LDFLAGS: '-Wl,-rpath,{{pkgx.prefix}},-headerpad_max_install_names -lresolv',
        ARGS: ['--with-zip', '--enable-dtrace', '--with-ldap-sasl'],
      },
      'darwin/x86-64': {
        // causes libtool to: <unknown>:0: error: invalid CFI advance_loc expression
        CFLAGS: '-fno-sanitize=all',
        CXXFLAGS: '-fno-sanitize=all',
      },
    },
  },
}
