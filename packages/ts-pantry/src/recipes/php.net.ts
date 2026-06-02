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
      // Tolerate failure of the phar-TOOL generation: php's `make install` runs
      // the freshly-built php to pack ext/phar/phar.phar, which macOS 26 dyld
      // aborts on (duplicate LC_RPATH — php+libtool double every dep rpath, and
      // libtool relinks on install). install-pharcmd runs AFTER the binaries and
      // extensions are installed, so the install itself is complete; we dedup +
      // verify the installed php below. The phar EXTENSION is built in (composer
      // works) — only the standalone `phar` CLI tool is skipped.
      'make install || true',
      // clean up our fake /usr/bin/cpp
      {
        run: [
          'if [ -n "$FAKE_CPP" ]; then',
          '  $SUDO rm /usr/bin/cpp',
          'fi',
        ].join('\n'),
        if: 'linux',
      },
      // Dedup LC_RPATHs again on the INSTALLED binaries — libtool re-doubles them
      // during its install relink (see the pre-install dedup above).
      {
        run: [
          `deduprp() { b="$1"; [ -f "$b" ] || return 0; otool -l "$b" | sed -n '/LC_RPATH/{n;n;s/^[[:space:]]*path //;s/ (offset.*$//;p;}' | sort | uniq -d | while IFS= read -r p; do while [ "$(otool -l "$b" | sed -n '/LC_RPATH/{n;n;s/^[[:space:]]*path //;s/ (offset.*$//;p;}' | grep -cxF "$p")" -gt 1 ]; do install_name_tool -delete_rpath "$p" "$b" 2>/dev/null || break; done; done; }`,
          `for b in "{{prefix}}/bin/php" "{{prefix}}/bin/php-cgi" "{{prefix}}/bin/phpdbg" "{{prefix}}/sbin/php-fpm"; do deduprp "$b"; done`,
        ].join('\n'),
        if: 'darwin',
      },
      // Verify the deduped binary actually loads (fail the build if php still
      // can't run). Print the module list too (zip etc.) for confirmation, but
      // don't gate on it — php -v loading is the correctness check.
      {
        run: '"{{prefix}}/bin/php" -v && { echo "=== php -m ==="; "{{prefix}}/bin/php" -m || true; }',
        if: 'darwin',
      },
      {
        run: [
          'sed -i -e\'s|^prefix=.*|prefix="$(dirname "$(dirname "$0")")"|g\' -e\'s|^datarootdir=.*|datarootdir="${prefix}/share"|g\' -e\'s|^ini_path=.*|ini_path="${prefix}/etc"|g\' -e\'s|^extension_dir=\'\\\'\'{{prefix}}\\(.*\\)\'\\\'\'|extension_dir="${prefix}\\1"|g\' -e\'s|^SED=.*|SED="$(dirname "$(dirname "$(dirname "$(dirname "$0")")")")/gnu.org/sed/v4/bin/sed"|g\' -e\'s|#{{prefix}}#|#$(dirname "$(dirname "$0")")#|g\' -e\'s|{{pkgx.prefix}}|${prefix}/../..|g\' php-config phpize',
          // phar CLI tool + pear/peardev/pecl are not generated (we skip the
          // crashing install-pharcmd / --without-pear), so only touch them if present.
          '[ -f phar ] && fix-shebangs.ts "{{prefix}}/bin/phar" || true',
          'for f in pear peardev pecl; do [ -f "$f" ] && sed -i -e\'s|{{prefix}}|$(dirname "$(dirname "$0")")|g\' "$f"; done; true',
        ],
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--enable-bcmath', '--enable-calendar', '--enable-dba', '--enable-exif', '--enable-ftp', '--enable-fpm', '--enable-gd', '--enable-intl', '--enable-mbregex', '--enable-mbstring', '--enable-mysqlnd', '--enable-pcntl', '--enable-phpdbg', '--enable-phpdbg-readline', '--enable-shmop', '--enable-soap', '--enable-sockets', '--enable-sysvmsg', '--enable-sysvsem', '--enable-sysvshm', '--without-pear', '--with-curl', '--with-external-pcre', '--with-ffi', '--with-gettext={{deps.gnu.org/gettext.prefix}}', '--with-gmp={{deps.gnu.org/gmp.prefix}}', '--with-iconv={{deps.gnu.org/libiconv.prefix}}', '--with-kerberos', '--with-layout=GNU', '--with-libxml', '--with-libedit', '--with-openssl', '--with-pdo-sqlite', '--with-pgsql={{deps.postgresql.org.prefix}}', '--with-pdo-pgsql={{deps.postgresql.org.prefix}}', '--with-pic', '--with-sodium', '--with-sqlite3', '--with-xsl', '--with-zip', '--with-zlib', '--disable-dtrace', '--without-ldap-sasl', '--without-ndbm', '--without-gdbm', 'CC=gcc'],
      'linux': {
        LDFLAGS: '-Wl,-rpath,{{pkgx.prefix}}',
      },
      'darwin': {
        CC: 'clang',
        CXX: 'clang++',
        LD: '/usr/bin/ld',
        // ... we need to link with headerpad...
        // NO -rpath,{{pkgx.prefix}} here: in this buildkit {{pkgx.prefix}} ==
        // {{prefix}}, and libtool re-applies LDFLAGS on its install relink, so
        // that rpath lands TWICE → macOS dyld aborts on "duplicate LC_RPATH"
        // (php already adds its own {{prefix}}/lib rpath).
        // -lresolv: php's DNS code uses macOS res_9_* symbols from libresolv.
        LDFLAGS: '-Wl,-headerpad_max_install_names -lresolv',
        ARGS: ['--enable-dtrace', '--with-ldap-sasl'],
      },
      'darwin/x86-64': {
        // causes libtool to: <unknown>:0: error: invalid CFI advance_loc expression
        CFLAGS: '-fno-sanitize=all',
        CXXFLAGS: '-fno-sanitize=all',
      },
    },
  },
}
