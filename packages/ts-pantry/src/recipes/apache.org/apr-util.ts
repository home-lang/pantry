import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/apr-util',
  name: 'apu-{{ version.major }}-config',
  description: 'Mirror of Apache Portable Runtime util',
  github: 'https://github.com/apache/apr-util',
  programs: ['apu-{{ version.major }}-config'],
  // apr-util links against apr at build and runtime; expat/sqlite/openssl are
  // optional backends that pkgx wires in at build time.
  dependencies: {
    'apache.org/apr': '*',
  },
  buildDependencies: {
    'apache.org/apr': '*',
    'openssl.org': '*',
    'libexpat.github.io': '*',
    'sqlite.org': '*',
  },
  versionSource: {
    type: 'github-tags',
    repo: 'apache/apr-util',
  },
  distributable: {
    url: 'https://dlcdn.apache.org/apr/apr-util-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-apr={{deps.apache.org/apr.prefix}}',
        '--includedir={{prefix}}/include',
        '--with-expat={{deps.libexpat.github.io.prefix}}',
        '--with-openssl={{deps.openssl.org.prefix}}',
        '--with-sqlite3={{deps.sqlite.org.prefix}}',
      ],
    },
  },

  test: {
    script: [
      'test "$(apu-{{version.major}}-config --version)" = {{version}}',
    ],
  },
}
