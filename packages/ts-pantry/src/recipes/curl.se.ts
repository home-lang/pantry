import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curl.se',
  name: 'cURL',
  description: 'A command line tool and library for transferring data with URL syntax, supporting DICT, FILE, FTP, FTPS, GOPHER, GOPHERS, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, MQTT, POP3, POP3S, RTMP, RTMPS, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET, TFTP, WS and WSS. libcurl offers a myriad of powerful features',
  homepage: 'https://curl.se',
  github: 'https://github.com/curl/curl',
  programs: ['curl', 'curl-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'curl/curl',
    tagPattern: /^curl-(\d+)_(\d+)_(\d+)$/,
  },
  distributable: {
    url: 'https://curl.se/download/curl-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^3',
    'curl.se/ca-certs': '*',
    'zlib.net': '^1.2.11',
    'nghttp2.org': '*',
    // Everything the SHIPPED libcurl.pc names in Requires.private, so a
    // downstream `pkg-config libcurl` can resolve. Read off the published
    // 8.22.0 linux-x86-64 artifact rather than guessed:
    //
    //   Requires.private: libidn2,zlib,libbrotlidec,libbrotlicommon,libzstd,
    //                     openssl,libnghttp2
    //
    // configure links whatever it finds on the build host and records it there,
    // so an undeclared one is invisible until some other package asks
    // pkg-config for libcurl. php.net failed first on libidn2 and then, once
    // that was declared, on libbrotlidec — one at a time, because the list was
    // never read in full.
    'gnu.org/libidn2': '*',
    'github.com/google/brotli': '*',
    'facebook.com/zstd': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--with-openssl', '--without-libpsl', '--with-ca-fallback', '--with-nghttp2'],
    },
  },
  test: {
    required: true,
    script: [
      'env -u LD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH {{prefix}}/bin/curl --version',
    ],
  },
}
