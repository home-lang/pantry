import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tldr.sh',
  name: 'tldr',
  description: 'C command-line client for tldr pages 📚',
  github: 'https://github.com/tldr-pages/tldr-c-client',
  programs: ['tldr'],
  versionSource: {
    type: 'github-releases',
    repo: 'tldr-pages/tldr-c-client',
  },
  distributable: {
    url: 'https://github.com/tldr-pages/tldr-c-client/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libzip.org': '^1.9.2',
    'curl.se': '*',
  },

  build: {
    script: [
      'make --environment-overrides --jobs {{ hw.concurrency }} install MANPATH=$MANPATH',
    ],
    env: {
      'PREFIX': '${{prefix}}',
      'MANPATH': '${{prefix}}/share/man/man1',
      'CFLAGS': '-ggdb -O0 -ftrapv -fPIC',
    },
  },
}
