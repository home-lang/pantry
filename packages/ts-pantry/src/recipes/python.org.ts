import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/python.org',
  domain: 'python.org',
  name: 'python',
  description: 'The Python programming language',
  homepage: 'https://www.python.org',
  github: 'https://github.com/python/cpython',
  programs: ['python', 'python{{version.major}}', 'python{{version.marketing}}'],
  versionSource: {
    type: 'github-tags',
    repo: 'python/cpython',
    tagPattern: /^v?(\d+(?:\.\d+){0,3})$/,
  },
  distributable: {
    url: 'https://www.python.org/ftp/python/{{version.raw}}/Python-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '1',
    'sourceware.org/bzip2': '1',
    'openssl.org': '^1.1',
    'sourceware.org/libffi': '3',
    'libexpat.github.io': '2',
    'bytereef.org/mpdecimal': '2',
    'tukaani.org/xz': '5',
    'sqlite.org': '3',
    'gnu.org/readline': '8',
    'invisible-island.net/ncurses': '6',
    'facebook.com/zstd': '>=1.5',
    'tcl-lang.org': '~8.6',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/make': '*',
    'gnu.org/patch': '*',
    'curl.se': '*',
  },
  dependencyOverrides: [{
    if: '>=3.12<3.13',
    dependencies: {
      linux: {
        'github.com/thkukuk/libnsl': '^2',
        'sourceforge.net/libtirpc': '^1',
        'github.com/besser82/libxcrypt': '^4',
      },
    },
  }],

  build: {
    script: [
      // Modern CPython builds against the declared Pantry headers/libraries.
      // Keep historical release patches below isolated from the current build.
      'if test {{version.major}} -gt 3 || { test {{version.major}} -eq 3 && test {{version.minor}} -ge 12; }; then',
      './configure $ARGS --with-ensurepip=install --with-pkg-config=yes --with-openssl={{deps.openssl.org.prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'ln -sf python{{version.marketing}} {{prefix}}/bin/python',
      'ln -sf python{{version.marketing}}-config {{prefix}}/bin/python-config',
      'mkdir -p {{prefix}}/share/licenses/python',
      'cp LICENSE {{prefix}}/share/licenses/python/LICENSE',
      'else',
      // MacPorts has a series of patches to keep python2 working
      {
        run: [
          'for PATCH in $PYTHON2PATCHES; do',
          '  curl -sSL $PATCH | patch -p0',
          'done',
        ].join('\n'),
        if: '^2',
      },

      // fixes the build scripts so they use the standard environment variables we set
      {
        run: [
          'sed -i -e \'s|system_lib_dirs = .*|system_lib_dirs = os.getenv("LIBRARY_PATH").split(":")|\' ./setup.py',
          'sed -i -e \'s|system_include_dirs = .*|system_include_dirs = os.getenv("CPATH").split(":")|\' ./setup.py',
        ].join('\n'),
        if: '<3.12',
      },

      // older versions use a different config dir
      {
        run: [
          'confdir="$libdir/config"',
          '# aarch64 not happy with this',
          'ARGS=${ARGS/--with-ensurepip/--without-ensurepip}',
        ].join('\n'),
        if: '^2',
      },

      // 3.7 and older use `3.7m` for config dir
      {
        run: [
          'confdir=$(echo $confdir | sed -e \'s/\\(config-{{version.marketing}}\\)/\\1m/\')',
          '# 3.7 and older use `python3.7m` for include dir',
          'SUFFIX=m',
          '# 3.7 aborts on linux+aarch64 with this',
          'ARGS=${ARGS/--with-ensurepip/--without-ensurepip}',
        ].join('\n'),
        if: '>=3<3.8',
      },

      // 3.5 and older don't append the platform to confdir
      { run: 'confdir="$libdir/config-{{version.marketing}}m"', if: '>=3<3.6' },

      // Older patches have configure issues that aren't present in newer patches
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  sed -i \\',
          '      -e \'s/ppc)/arm64)/g\' \\',
          '      -e \'s/MACOSX_DEFAULT_ARCH="ppc.*$/MACOSX_DEFAULT_ARCH="arm64"/g\' \\',
          '      configure',
          'fi',
        ].join('\n'),
        if: '>=3<3.9.1',
      },
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  sed -i -e \'s/^MULTIARCH=.*$/MULTIARCH=""/\' configure',
          'fi',
        ].join('\n'),
        if: '>=3<3.10.1',
      },

      // Some old versions don't support macOS 11 and greater in their configures
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  curl -L https://github.com/python/cpython/commit/8ea6353.patch | patch -p1',
          'fi',
        ].join('\n'),
        if: '>=3.8<3.8.4 || >=3<3.7.8',
      },

      // Versions older than 3.5.3 have an include issue on darwin
      { run: 'patch -p1 < props/patch3.5.diff', if: '>=3.5<3.5.3' },

      // Whitespace difference in 3.4...
      { run: 'patch -p1 < props/patch3.4.diff', if: '~3.4.1' },

      // 3.12.0 needs help with mpdecimal
      { run: 'sed -i \'s/libmpdec_machine=universal/libmpdec_machine=x64/\' configure', if: 'darwin/x86-64' },
      { run: 'sed -i \'s/libmpdec_machine=universal/libmpdec_machine=uint128/\' configure', if: 'darwin/aarch64' },

      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',

      // customize `pip install` locations to tea defaults
      'cp props/sitecustomize.py {{prefix}}/lib/python{{version.marketing}}',

      // provide unversioned symlinks
      {
        run: [
          'for x in python idle pydoc; do',
          '  ln -sf ${x}{{version.marketing}} $x',
          'done',
          'ln -sf python{{version.marketing}}-config python-config',
        ].join('\n'),
        'working-directory': '{{prefix}}/bin',
      },

      // we provide the binaries in a separate package
      // but we don't use --without-ensurepip because stuff expects python to
      // come bundled with setuptools
      {
        run: 'find . -mindepth 1 -maxdepth 1 -type f -name \'pip*\' -exec rm {} \\;',
        'working-directory': '{{prefix}}/bin',
      },

      // make relocatable
      {
        run: [
          'for binfile in $shebangs $confdir/python-config.py; do',
          '  if ! test -f $binfile; then',
          '    binfile=${binfile/{{version.marketing}}/{{version.marketing}}$SUFFIX}',
          '  fi',
          '  if ! test -f $binfile; then',
          '    continue',
          '  fi',
          '  binfile=$(readlink -f $binfile)',
          '  sed -i.bak -e \'s|#!{{prefix}}/bin/|#!/usr/bin/env |g\' $binfile',
          '  rm $binfile.bak',
          'done',
          'sed -i -e \'s|{{prefix}}|\\\\$(or $(PKGX_DIR),$(HOME)/.pkgx)/python.org/v{{version.major}}|g\' $confdir/Makefile',
        ].join('\n'),
        'working-directory': '{{prefix}}',
      },

      // rewrite the sysconfig data so `/opt/` paths point at the install prefix
      {
        run: [
          'cat <<\'DEV_PKGX_EOF\' >> _sysconfigdata__*.py',
          'import os',
          'import re',
          '',
          'pkgx_prefix = os.path.normpath(os.path.join(os.path.dirname(__file__), \'../../../../\'))',
          'for key in build_time_vars:',
          '  if isinstance(build_time_vars[key], str):',
          '    build_time_vars[key] = re.sub(r\'(\\s|^)/opt/\', r\'\\g<1>{}/\'.format(pkgx_prefix), build_time_vars[key])',
          '    build_time_vars[key] = re.sub(r\'\\+brewing\', r\'\', build_time_vars[key])',
          'DEV_PKGX_EOF',
        ].join('\n'),
        'working-directory': '{{prefix}}/lib/python{{version.marketing}}',
      },

      // force pip to user-install mode without sudo
      'ln -s /dev {{prefix}}/lib/python{{version.marketing}}/site-packages',

      // some stuff expects python includes to be accessible without the prefix
      {
        run: [
          'mv python{{version.marketing}}$SUFFIX/* .',
          'rmdir python{{version.marketing}}$SUFFIX',
          'ln -s . python{{version.marketing}}',
          '# Keep the suffixed version if we started with one',
          'if test -n "$SUFFIX"; then',
          '  ln -s . python{{version.marketing}}$SUFFIX',
          'fi',
        ].join('\n'),
        'working-directory': '{{prefix}}/include',
      },
      'fi',
    ],
    env: {
      'ARGS': [
        '--prefix={{prefix}}',
        '--with-ensurepip',
        '--enable-ipv6',
        '--disable-loadable-sqlite-extensions',
        '--with-system-expat',
        '--with-system-ffi',
        '--with-system-libmpdec',
        '--enable-shared',
      ],
      'libdir': 'lib/python{{version.marketing}}',
      'darwin': {
        'confdir': '$libdir/config-{{version.marketing}}-darwin',
        'PYTHON2PATCHES': ['https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-getpath.diff'],
      },
      'linux': {
        'ARCH': '{{hw.arch}}',
        'confdir': '$libdir/config-{{version.marketing}}-${ARCH/-/_}-linux-gnu',
        'CFLAGS': '${CFLAGS:+$CFLAGS }-fPIC',
      },
      'shebangs': ['bin/2to3-{{version.marketing}}', 'bin/idle{{version.marketing}}', 'bin/pydoc{{version.marketing}}', 'bin/python{{version.marketing}}-config'],
      'CPPFLAGS': '${CPPFLAGS:+$CPPFLAGS }-I{{deps.zlib.net.prefix}}/include',
      'LDFLAGS': '${LDFLAGS:+$LDFLAGS }-L{{deps.zlib.net.prefix}}/lib',
      'OPENSSL_INCLUDES': '{{deps.openssl.org.prefix}}/include',
      'OPENSSL_LDFLAGS': '-L{{deps.openssl.org.prefix}}/lib',
      'PYTHON2PATCHES': ['https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-Makefile.pre.in.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-setup.py.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-Lib-cgi.py.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-Lib-ctypes-macholib-dyld.py.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-configure.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-libedit.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/enable-loadable-sqlite-extensions.patch', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/patch-_osx_support.py.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/darwin20.diff', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/arm.patch', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/implicit.patch', 'https://raw.githubusercontent.com/macports/macports-ports/master/lang/python27/files/openssl_ver.patch'],
    },
  },
  test: {
    required: true,
    script: [
      'if test {{version.major}} -gt 3 || { test {{version.major}} -eq 3 && test {{version.minor}} -ge 12; }; then',
      "env -u LD_LIBRARY_PATH -u DYLD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH -u TCL_LIBRARY -u TK_LIBRARY {{prefix}}/bin/python{{version.marketing}} - <<'PANTRY_PYTHON_HEALTH'",
      'import bz2, ctypes, decimal, lzma, readline, sqlite3, ssl, sys, sysconfig, tkinter, zlib',
      'assert sys.version.split()[0] == "{{version.raw}}", sys.version',
      'assert sqlite3.connect(":memory:").execute("select 42").fetchone() == (42,)',
      'assert tkinter.Tcl().eval("info patchlevel").startswith("8.6."), tkinter.TclVersion',
      'assert sysconfig.get_config_var("INCLUDEPY"), "Missing development configuration"',
      'if sys.platform.startswith("linux") and sys.version_info < (3, 13):',
      '    import nis',
      '    import crypt',
      '    assert crypt.crypt("pantry", "$6$pantry$").startswith("$6$pantry$")',
      'print(sys.version, ssl.OPENSSL_VERSION, tkinter.TclVersion)',
      'PANTRY_PYTHON_HEALTH',
      'fi',
    ],
  },
}
