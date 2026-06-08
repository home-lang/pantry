import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: '../props/gnupg.org',
  domain: 'gnupg.org/v2.5',
  name: 'v2.5',
  // pkgx: "currently not ready for darwin"; build/test only on linux
  platforms: ['linux'],
  programs: [],
  dependencies: {
    'zlib.net': '^1.1',
    'sourceware.org/bzip2': '*',
    'gnupg.org/npth': '*',
    'gnupg.org/libgpg-error': '*',
    'gnupg.org/libksba': '*',
    'gnupg.org/libassuan': '3',
    'gnupg.org/libgcrypt': '^1.11',
    'gnupg.org/pinentry': '*',
    'gnutls.org': '^3',
    'openldap.org': '^2',
    'gnu.org/readline': '^8',
    'sqlite.org': '^3',
    darwin: {
      'gnu.org/gettext': '^0.21',
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
    darwin: {
      'gnu.org/patch': '*',
    },
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/gnupg/gnupg-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -e \'/#include "exechelp.h"/a\\\n\\\n#if defined (__APPLE__)\\\nextern char** environ;\\\n#endif\' \\\nexechelp-posix.c\n',
        'working-directory': 'common',
      },
      {
        run: 'patch -p1 < props/proc-fix.diff',
        if: 'darwin',
      },
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
      'cp props/gpgconf.ctl {{prefix}}/bin',
      {
        run: 'sed -i "s|{{prefix}}|\\$(dirname \\$0)/..|g" gpg-wks-client',
        'working-directory': '{{prefix}}/libexec',
      },
      {
        run: 'mkdir -p var/run etc/gnupg\nchmod 700 etc/gnupg\n',
        'working-directory': '{{prefix}}',
      },
      {
        run: 'cp props/gpg.conf {{prefix}}/etc/gnupg/gpg.conf',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--sysconfdir={{prefix}}/etc',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--with-pinentry-pgm={{deps.gnupg.org/pinentry.prefix}}/bin/pinentry',
      ],
      CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
    },
  },
  test: {
    script: [
      'killall gpg-agent || true',
      'gpg --version | grep {{version}}',
      'gpgconf --launch keyboxd',
      'gpgconf --launch gpg-agent',
      'gpg --quick-gen-key --batch --passphrase ""  "Testing" default default never',
      'gpg --detach-sign test.txt',
      'gpg --verify test.txt.sig',
    ],
  },
}
