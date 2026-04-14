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
    'gnu.org/libsigsegv': '*',
    'gnu.org/readline': '*',
    'github.com/besser82/libxcrypt': '*',
  },

  build: {
    script: [
      'cd "src/gllib"',
      'sed -i \'s/__ppc64__/__aarch64__ || __ppc64__/\' vma-iter.c',
      './configure $ARGS',
      'cd "src"',
      'sed -i \'s/^FALIGNFLAGS =/FALIGNFLAGS = -falign-functions=8/\' Makefile',
      'cd "src"',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      '',
      'rm -rf {{prefix}}/bin/*.dSYM',
      'cd "{{prefix}}/bin"',
      'mkdir -p ../tbin',
      'mv clisp ../tbin',
      'cat $PROP > clisp',
      'chmod +x clisp',
      '',
    ],
    env: {
      'FORCE_UNSAFE_CONFIGURE': '1',
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--with-readline=yes', '--with-libsigsegv-prefix={{deps.gnu.org/libsigsegv.prefix}}', '--enable-portability'],
    },
  },
}
