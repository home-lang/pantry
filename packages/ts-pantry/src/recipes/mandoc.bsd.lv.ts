import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mandoc.bsd.lv',
  name: 'mandoc.bsd.lv',
  description: 'UNIX manpage compiler toolset',
  homepage: 'https://mandoc.bsd.lv/',
  programs: ['bsdapropos', 'bsdman', 'bsdsoelim', 'bsdwhatis', 'demandoc', 'mandoc'],
  distributable: {
    url: 'https://mandoc.bsd.lv/snapshots/mandoc-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
  },

  build: {
    script: [
      'mv cgi.h.example cgi.h',
      'cat $PROP >configure.local',
      '',
      './configure',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
