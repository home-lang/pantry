import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org',
  name: 'gnupg',
  description: 'GNU Pretty Good Privacy (PGP) package',
  homepage: 'https://gnupg.org/',
  programs: ['gpg', 'gpg-agent', 'gpg-connect-agent', 'gpg-wks-server', 'gpgconf', 'gpgparsemail', 'gpgscm', 'gpgsm', 'gpgsplit', 'gpgtar', 'gpgv', 'kbxutil', 'watchgnupg'],
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/gnupg/gnupg-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1.1',
    'sourceware.org/bzip2': '*',
    'gnupg.org/npth': '*',
    'gnupg.org/libgpg-error': '*',
    'gnupg.org/libksba': '*',
    'gnupg.org/libassuan': '2',
    'gnupg.org/libgcrypt': '*',
    'gnupg.org/pinentry': '*',
    'gnutls.org': '^3',
    'openldap.org': '^2',
    'gnu.org/readline': '^8',
    'sqlite.org': '^3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      'cp props/gpgconf.ctl {{prefix}}/bin',
      'cd "{{prefix}}/libexec"',
      'sed -i.bak "s|{{prefix}}|\\$(dirname \\$0)/..|g" gpg-wks-client',
      'rm gpg-wks-client.bak',
      '',
      'cd "{{prefix}}"',
      'mkdir -p var/run etc/gnupg',
      'chmod 700 etc/gnupg',
      '',
      'cp props/gpg.conf {{prefix}}/etc/gnupg/gpg.conf',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--sysconfdir={{prefix}}/etc', '--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--with-pinentry-pgm={{deps.gnupg.org/pinentry.prefix}}/bin/pinentry'],
      'CFLAGS': '$CFLAGS -Wno-implicit-function-declaration',
    },
  },
}
