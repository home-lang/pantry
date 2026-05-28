import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/openssl.org',
  domain: 'openssl.org',
  name: 'OpenSSL',
  description: 'TLS/SSL and crypto library with QUIC APIs',
  homepage: 'https://quictls.github.io/openssl',
  github: 'https://github.com/quictls/openssl',
  programs: ['openssl', 'c_rehash'],
  versionSource: {
    type: 'github-releases',
    repo: 'quictls/openssl',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.openssl.org/source/openssl-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // Version-gated patches (pkgx ships separate diffs across the 3.4.0 line).
      { run: 'patch -p1 <props/x509_def.c.diff', if: '<3.4.0' },
      { run: 'patch -p1 <props/x509_def.c.post3.4.0.diff', if: '>=3.4.0' },
      // $ARCH is the OpenSSL Configure target, set per-arch via build.env below.
      './Configure --prefix={{prefix}} $ARCH no-tests $ARGS --openssldir={{prefix}}/ssl',
      'make --jobs {{hw.concurrency}}',
      'make install_sw # `_sw` avoids installing docs',
      // Install the default openssl.cnf shipped in the source tree.
      { run: 'cp $SRCROOT/apps/openssl.cnf .', 'working-directory': '{{prefix}}/ssl' },
    ],
    env: {
      'darwin/aarch64': { ARCH: 'darwin64-arm64-cc' },
      'darwin/x86-64': { ARCH: 'darwin64-x86_64-cc' },
      'linux/aarch64': { ARCH: 'linux-aarch64' },
      'linux/x86-64': { ARCH: 'linux-x86_64' },
      // supposedly enables important optimizations
      'darwin': { ARGS: 'enable-ec_nistp_64_gcc_128' },
    },
  },
}
