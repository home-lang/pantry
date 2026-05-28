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
          's/dynamic = \\["version"\\]/version = "{{version.raw}}"/',
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

      // 7.96 is looking for libpcap/VERSION, but it's still named VERSION.txt, as in prior versions
      {
        run: 'sed -i \'s|/VERSION`|/VERSION.txt`|\' Makefile',
        'working-directory': 'libpcap',
      },

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
    },
  },
}
