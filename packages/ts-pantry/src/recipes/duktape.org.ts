import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'duktape.org',
  name: 'duk',
  description: 'Duktape - embeddable Javascript engine with a focus on portability and compact footprint',
  homepage: 'https://duktape.org',
  github: 'https://github.com/svaarala/duktape',
  programs: ['duk'],
  versionSource: {
    type: 'github-releases',
    repo: 'svaarala/duktape',
  },
  distributable: {
    url: 'https://github.com/svaarala/duktape/releases/download/v{{version}}/duktape-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make -f Makefile.sharedlibrary install',
      'make -f Makefile.cmdline',
      'mkdir -p {{prefix}}/bin',
      'install duk {{prefix}}/bin/',
    ],
    env: {
      'INSTALL_PREFIX': '{{prefix}}',
    },
  },
}
