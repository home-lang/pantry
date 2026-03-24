import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rtmpdump.mplayerhq.hu',
  name: 'rtmpdump',
  description: 'Tool for downloading RTMP streaming media',
  homepage: 'https://rtmpdump.mplayerhq.hu/',
  programs: ['rtmpdump', 'rtmpgw', 'rtmpsrv', 'rtmpsuck'],
  distributable: {
    url: 'http://rtmpdump.mplayerhq.hu/download/rtmpdump-{{version.marketing}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'curl.se': '*',
  },

  build: {
    script: [
      'curl $PATCH | patch -p0 || true',
      'make XCFLAGS="$CFLAGS" XLDFLAGS="$LDFLAGS" $ARGS install',
    ],
    env: {
      'PATCH': 'https://raw.githubusercontent.com/Homebrew/formula-patches/85fa66a9/rtmpdump/openssl-1.1.diff',
      'ARGS': ['CC=cc', 'prefix={{prefix}}', 'SHARED=no'],
    },
  },
}
