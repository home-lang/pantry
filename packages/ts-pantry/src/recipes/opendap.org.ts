import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'opendap.org',
  name: 'opendap',
  description: 'A new version of libdap that contains both DAP2 and DAP4 support',
  homepage: 'https://www.opendap.org/',
  github: 'https://github.com/OPENDAP/libdap4',
  programs: ['dap-config', 'dap-config-pkgconfig', 'getdap', 'getdap4'],
  versionSource: {
    type: 'github-releases',
    repo: 'OPENDAP/libdap4',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.opendap.org/pub/source/libdap-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/libxml2': '*',
    'openssl.org': '*',
    'curl.se': '*',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'freedesktop.org/pkg-config': '*',
    'github.com/westes/flex': '*',
    'gnu.org/patch': '*',
  },

  build: {
    script: [
      'curl $PATCH | patch -p1 || true',
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} check',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-dependency-tracking', '--disable-debug', '--with-included-regex'],
    },
  },
}
