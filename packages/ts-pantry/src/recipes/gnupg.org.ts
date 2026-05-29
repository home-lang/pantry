import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/gnupg.org',
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
    // nobody (in pkgx) added a comment to say why this is Darwin only
    darwin: {
      'gnu.org/gettext': '^0.21',
    },
  },

  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',

      // this makes the lookup machinery relocatable, see runtime env
      'cp props/gpgconf.ctl {{prefix}}/bin',

      {
        run: [
          'sed -i.bak "s|{{prefix}}|\\$(dirname \\$0)/..|g" gpg-wks-client',
          'rm gpg-wks-client.bak',
        ],
        'working-directory': '{{prefix}}/libexec',
      },
      {
        run: [
          'mkdir -p var/run etc/gnupg',
          'chmod 700 etc/gnupg',
        ],
        'working-directory': '{{prefix}}',
      },

      // nobody added a comment explaining why this conf is required
      'cp props/gpg.conf {{prefix}}/etc/gnupg/gpg.conf',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--sysconfdir={{prefix}}/etc', '--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--with-pinentry-pgm={{deps.gnupg.org/pinentry.prefix}}/bin/pinentry'],
      'CFLAGS': '$CFLAGS -Wno-implicit-function-declaration',
    },
  },
}
