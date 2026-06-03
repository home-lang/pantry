import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/guile',
  name: 'guile',
  programs: [
    'guild',
    'guile',
    'guile-config',
    'guile-snarf',
    'guile-tools',
  ],
  dependencies: {
    'hboehm.info/gc': '^8',
    'gnu.org/gmp': '^6',
    'gnu.org/libtool': '^2',
    'gnu.org/libunistring': '^1',
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/readline': '^8',
    'gnu.org/gperf': '^3',
    'sourceware.org/libffi': '^3',
    'github.com/besser82/libxcrypt': '^4',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/guile/guile-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'sed -i "s|{{prefix}}|\\$(dirname \\$0)/..|g" {{prefix}}/bin/guile-config',
      'sed -i "s|${GUILE:-{{prefix}}/bin/guile}|\\$(dirname \\$0)/guile|g" {{prefix}}/bin/guild',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-dependency-tracking',
        '--with-libreadline-prefix={{deps.gnu.org/readline.prefix}}',
        '--with-libgmp-prefix={{deps.gnu.org/gmp.prefix}}',
        '--disable-nls',
      ],
    },
  },
  test: {
    script: [
      'guile --version | grep {{version}}',
      'guile $FIXTURE | grep "Hello World"',
      'guile-config --help',
    ],
  },
}
