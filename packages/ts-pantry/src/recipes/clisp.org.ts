import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'clisp.org',
  name: 'clisp',
  description: 'GNU CLISP, a Common Lisp implementation',
  homepage: 'https://clisp.sourceforge.io/',
  programs: ['clisp'],
  distributable: {
    url: 'https://alpha.gnu.org/gnu/clisp/clisp-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libsigsegv': '^2.14',
    'gnu.org/readline': '^8.2',
    'github.com/besser82/libxcrypt': '^4.4',
  },

  build: {
    script: [
      // Fix build on ARM (bundled gnulib vma-iter.c)
      {
        run: 'sed -i \'s/__ppc64__/__aarch64__ || __ppc64__/\' vma-iter.c',
        if: 'aarch64',
        'working-directory': 'src/gllib',
      },

      './configure $ARGS',

      // configure misses this on linux/aarch64
      {
        run: 'sed -i \'s/^FALIGNFLAGS =/FALIGNFLAGS = -falign-functions=8/\' Makefile',
        if: 'linux/aarch64',
        'working-directory': 'src',
      },

      {
        run: [
          'make --jobs {{hw.concurrency}}',
          'make --jobs {{hw.concurrency}} install',
        ],
        'working-directory': 'src',
      },

      // otherwise we have a bunch of rpath fix issues
      {
        run: 'rm -rf {{prefix}}/bin/*.dSYM',
        if: 'darwin',
      },

      // clisp bakes prefix into the bin, but it has a flag to override it
      {
        run: [
          'mkdir -p ../tbin',
          'mv clisp ../tbin',
          'cat $PROP > clisp',
          'chmod +x clisp',
        ],
        prop: {
          content: [
            '#!/bin/sh',
            '',
            'd="$(cd "$(dirname "$0")"/.. && pwd)"',
            '',
            '"$d"/tbin/clisp -B "$d/lib/clisp-{{version}}" "$@"',
            '',
          ].join('\n'),
        },
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      'FORCE_UNSAFE_CONFIGURE': '1',
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--with-readline=yes', '--with-libsigsegv-prefix={{deps.gnu.org/libsigsegv.prefix}}', '--enable-portability'],
      'darwin': {
        ARGS: ['--disable-rpath'],
      },
    },
  },
}
