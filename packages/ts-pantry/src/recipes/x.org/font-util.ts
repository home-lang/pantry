import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/font-util',
  name: 'font-util',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/util/font-util/-/archive/font-util-{{version.raw}}/font-util-font-util-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gitlab.freedesktop.org/xorg/util/font-util/-/archive/font-util-{{version}}/font-util-font-util-{{version}}.tar.gz',
    knownVersions: ['1.4.1', '1.4.0', '1.3.3', '1.3.2', '1.3.1'],
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --exists fontutil',
    ],
  },
}
