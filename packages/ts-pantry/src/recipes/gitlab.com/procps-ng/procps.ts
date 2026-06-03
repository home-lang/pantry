import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gitlab.com/procps-ng/procps',
  name: 'procps',
  programs: [
    'free',
    'pgrep',
    'pidof',
    'pkill',
    'pmap',
    'ps',
    'pwdx',
    'slabtop',
    'sysctl',
    'tload',
    'top',
    'vmstat',
    'w',
  ],
  dependencies: {
    'invisible-island.net/ncurses': '>=6.0',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/gettext': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://gitlab.com/procps-ng/procps/-/archive/v{{ version }}/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make -j {{ hw.concurrency }} install',
      {
        run: 'rm kill uptime watch',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{ prefix }}',
        '--disable-nls',
        '--disable-pidwait',
      ],
    },
  },
}
