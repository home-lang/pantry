import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'openssl.org',
  name: 'OpenSSL',
  description: 'TLS/SSL and crypto library with QUIC APIs',
  homepage: 'https://quictls.github.io/openssl',
  github: 'https://github.com/quictls/openssl',
  programs: ['', '', '', '', '', '', '', ''],
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
      'run: patch -p1 <props/x509_def.c.diff',
      'run: patch -p1 <props/x509_def.c.post3.4.0.diff',
      './Configure --prefix={{ prefix }} $ARCH no-tests $ARGS --openssldir={{prefix}}/ssl',
      'make --jobs {{ hw.concurrency }}',
      'make install_sw # `_sw` avoids installing docs',
      'cd "{{prefix}}"',
      'run: cp $SRCROOT/apps/openssl.cnf .',
      'echo "This is a test file" > in',
      'openssl dgst -sha256 -out out ./in',
      'run: test "$(cat ./out)" = "SHA2-256(./in)= $SAMPLE"',
      'run: test "$(cat ./out)" = "SHA256(./in)= $SAMPLE"',
      'run: pkgx wget tea.xyz',
    ],
  },
}
