import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'agwa.name/git-crypt',
  name: 'git-crypt',
  programs: [
    'git-crypt',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  build: {
    script: [
      // The man page requires the full docbook-xsl stylesheet chain, which is
      // not provisioned in the build environment. git-crypt's man page is
      // optional (ENABLE_MAN defaults off); build just the binary so the
      // package is reliably installable.
      'make PREFIX={{prefix}}',
      'make PREFIX={{prefix}} install',
    ],
    env: {
      CFLAGS: '$CFLAGS -DOPENSSL_API_COMPAT=0x30000000L',
    },
  },
  test: {
    script: [
      'git-crypt keygen keyfile',
      'ls | grep keyfile',
      'git-crypt version | grep {{version}}',
    ],
  },
}
