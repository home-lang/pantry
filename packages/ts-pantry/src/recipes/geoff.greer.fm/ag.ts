import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'geoff.greer.fm/ag',
  name: 'ag',
  programs: [
    'ag',
  ],
  dependencies: {
    'pcre.org': '^8',
    'tukaani.org/xz': '^5.4.5',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/ggreer/the_silver_searcher/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf -fiv',
      './configure $ARGS',
      'make',
      'make install',
    ],
    env: {
      linux: {
        CFLAGS: '$CFLAGS -Wl,--allow-multiple-definition',
      },
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'ag \'Hello World!\' .',
      'ag --version | grep {{version}}',
    ],
  },
}
