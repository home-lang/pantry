import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mosh.org',
  name: 'mosh',
  description: 'Remote terminal application',
  homepage: 'https://mosh.org',
  github: 'https://github.com/mobile-shell/mosh',
  programs: ['mosh-client', 'mosh-server'],
  versionSource: {
    type: 'github-releases',
    repo: 'mobile-shell/mosh',
    tagPattern: /\/mosh-\//,
  },
  distributable: {
    url: 'https://github.com/mobile-shell/mosh/releases/download/{{version.tag}}/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'protobuf.dev': '26.1.0',
    'invisible-island.net/ncurses': '6',
    'zlib.net': '1.3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-completion', '--disable-silent-rules'],
      'CFLAGS': ['-DNDEBUG'],
      'CXXFLAGS': ['-std=gnu++17'],
    },
  },
}
