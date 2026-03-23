import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'libevent.org',
  name: 'libevent',
  description: 'Event notification library',
  homepage: 'https://libevent.org',
  github: 'https://github.com/libevent/libevent',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libevent/libevent/tags',
    tagPattern: /\/^release-\/,\/-stable$\//,
  },
  distributable: {
    url: 'https://github.com/libevent/libevent/releases/download/release-{{version}}-stable/libevent-{{version}}-stable.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'gnu.org/libtool': '2',
    'gnu.org/automake': '1',
    'gnu.org/autoconf': '2',
    'freedesktop.org/pkg-config': '^0.29',
  },

  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make V=1 --jobs {{ hw.concurrency }}',
      'make install',
      'cd "{{prefix}}/lib/pkgconfig"',
      'sed -i -e \'s|{{deps.openssl.org.prefix}}|\\${pcfiledir}/../../../../openssl.org/v{{deps.openssl.org.version.major}}|g\' *.pc',
    ],
    env: {
      'ARGS': ['--disable-debug-mode', '--prefix="{{prefix}}"'],
    },
  },
}
