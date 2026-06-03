import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/nmap.org',
  domain: 'nmap.org',
  name: 'nmap',
  description: 'Port scanning utility for large networks',
  homepage: 'https://nmap.org/',
  programs: ['nmap', 'ncat', 'nping'],
  distributable: {
    url: 'https://nmap.org/dist/nmap-{{version.raw}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'pcre.org/v2': '^10',
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'python.org': '3',
    'linux': {
      'kernel.org/linux-headers': '*',
    },
  },

  build: {
    script: [
      // https://github.com/openresty/openresty/issues/372
      { run: 'patch -p1 <props/openssl-1.1.1.patch', if: '<7.94.0' },

      // missing python modules
      'python -m venv $HOME/venv',
      'source $HOME/venv/bin/activate',
      'python -m pip install build setuptools',

      {
        run: [
          // setuptools can't resolve dynamic version in isolated build
          'sed -i -f $PROP ndiff/pyproject.toml',
          // EC_GROUP_get_field_type is OpenSSL 3.0+; upstream wrongly guards with HAVE_OPAQUE_STRUCTS
          'sed -i \'s/#elif HAVE_OPAQUE_STRUCTS/#elif OPENSSL_VERSION_NUMBER >= 0x30000000L/\' nse_ssl_cert.cc',
        ],
        prop: [
          's/dynamic = \\["version"\\]/version = {{version.raw}}/',
          '/\\[tool.setuptools.dynamic\\]/,/^$/d',
        ].join('\n'),
        if: '>=7.99',
      },

      // netpacket/packet.h is a glibc header not available in pkgx;
      // patch libdnet-stripped configure to skip the "Ethernet support not found" error
      // and force PF_PACKET support (always available on modern Linux)
      {
        run: 'sed -i \'s/as_fn_error.*Ethernet support not found.*/ac_cv_dnet_linux_pf_packet=yes/\' libdnet-stripped/configure',
        if: 'linux',
      },

      './configure $ARGS',

      // 7.96 is looking for libpcap/VERSION, but it's still named VERSION.txt, as in prior versions.
      // Guard on the Makefile existing: when configure detects a usable system/pantry libpcap
      // (e.g. 7.98 on Linux) it skips the bundled libpcap subdir entirely, so no libpcap/Makefile
      // is generated and an unconditional sed would abort the build under `set -e`.
      'if [ -f libpcap/Makefile ]; then sed -i \'s|/VERSION`|/VERSION.txt`|\' libpcap/Makefile; fi',

      'make -j {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': [
        '--prefix={{prefix}}',
        '--with-libpcre={{deps.pcre.org/v2.prefix}}',
        '--without-zenmap',
        '--with-compiledby=tea.xyz',
      ],
      // nmap.cc includes <getopt.h> only under `#if HAVE_GETOPT_H`, and its
      // configure probe for the header misfires under our compiler wrapper, so
      // the getopt symbols (no_argument/optional_argument/struct option/
      // getopt_long_only) end up undeclared. Force the cache vars so config.h
      // defines HAVE_GETOPT_H, and define _GNU_SOURCE for the GNU getopt
      // extensions. Linux always has <getopt.h>, so this is safe here.
      'CFLAGS': '$CFLAGS -D_GNU_SOURCE',
      'CXXFLAGS': '$CXXFLAGS -D_GNU_SOURCE',
      'linux': {
        'ac_cv_header_getopt_h': 'yes',
        'ac_cv_func_getopt_long': 'yes',
      },
    },
  },
}
