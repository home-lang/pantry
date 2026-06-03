import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tcl-lang.org/expect',
  name: 'expect',
  programs: [
    'autoexpect',
    'autopasswd',
    'cryptdir',
    'decryptdir',
    'dislocate',
    'expect',
    'ftp-rfc',
    'kibitz',
    'lpunlock',
    'mkpasswd',
    'multixterm',
    'passmass',
    'rftp',
    'rlogin-cwd',
    'timed-read',
    'timed-run',
    'tknewsbiff',
    'tkpasswd',
    'unbuffer',
    'weather',
    'xkibitz',
    'xpstat',
  ],
  dependencies: {
    'tcl.tk/tcl': '^8',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://cytranet.dl.sourceforge.net/project/expect/Expect/{{ version.raw }}/expect{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# Config scripts are from 2003',
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      'cd {{prefix}}/lib',
      'mv expect{{version.raw}}/* .',
      'rmdir expect{{version.raw}}',
    ],
    env: {
      ARGS: [
        '--prefix={{ prefix }}',
        '--exec-prefix={{ prefix }}',
        '--with-tcl={{ deps.tcl.tk/tcl.prefix }}/lib',
      ],
      darwin: {
        CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
      },
      linux: {
        CFLAGS: '$CFLAGS -Wno-implicit-int -Wno-implicit-function-declaration',
      },
    },
  },
  test: {
    script: [
      'test "$(echo \'Hello, World!\' | timed-read 1)" = \'Hello, World!\'',
    ],
  },
}
