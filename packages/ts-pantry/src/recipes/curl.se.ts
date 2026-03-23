import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'curl.se',
  name: 'cURL',
  description: 'A command line tool and library for transferring data with URL syntax, supporting DICT, FILE, FTP, FTPS, GOPHER, GOPHERS, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, MQTT, POP3, POP3S, RTMP, RTMPS, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET, TFTP, WS and WSS. libcurl offers a myriad of powerful features',
  homepage: 'https://curl.se',
  github: 'https://github.com/curl/curl',
  programs: ['curl', 'curl-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'curl/curl/releases',
    tagPattern: /\/^curl \//,
  },
  distributable: {
    url: 'https://curl.se/download/curl-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'curl.se/ca-certs': '*',
    'zlib.net': '^1.2.11',
    'nghttp2.org': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--with-openssl', '--without-libpsl', '--with-ca-fallback', '--with-nghttp2'],
    },
  },
}
