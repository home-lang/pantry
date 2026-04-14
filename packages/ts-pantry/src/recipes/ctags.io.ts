import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ctags.io',
  name: 'ctags',
  description: 'A maintained ctags implementation',
  homepage: 'https://ctags.io',
  github: 'https://github.com/universal-ctags/ctags',
  programs: ['ctags'],
  versionSource: {
    type: 'github-releases',
    repo: 'universal-ctags/ctags',
  },
  distributable: {
    url: 'https://github.com/universal-ctags/ctags/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'digip.org/jansson': '^2',
    'pyyaml.org/libyaml': '^0.2',
    'pcre.org/v2': '^10',
    'gnome.org/libxml2': '~2.13',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'python.org': '>=3.11',
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', 'RST2MAN=true'],
    },
  },
}
