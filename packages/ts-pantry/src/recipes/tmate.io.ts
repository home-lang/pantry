import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tmate.io',
  name: 'tmate',
  description: 'Instant Terminal Sharing',
  homepage: 'https://tmate.io/',
  github: 'https://github.com/tmate-io/tmate',
  programs: ['tmate'],
  versionSource: {
    type: 'github-releases',
    repo: 'tmate-io/tmate',
  },
  distributable: {
    url: 'https://github.com/tmate-io/tmate/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libevent.org': '^2.0',
    'invisible-island.net/ncurses': '6',
    'msgpack.org': '6',
    'libssh.org': '0',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'autoupdate',
      './autogen.sh',
      './configure --prefix={{prefix}}',
      'make',
      'make install',
    ],
    env: {
      'CFLAGS': '$CFLAGS -Wno-implicit-function-declaration',
    },
  },
}
