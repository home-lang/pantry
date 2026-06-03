import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xiph.org/flac',
  name: 'flac',
  programs: [
    'flac',
  ],
  dependencies: {
    'xiph.org/ogg': '^1.3.5',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/libtool': '^2.4',
    'gnu.org/automake': '^1.16',
    'gnu.org/autoconf': '^2.71',
  },
  distributable: {
    url: 'https://downloads.xiph.org/releases/flac/flac-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix="{{prefix}}"',
        '--enable-static',
      ],
    },
  },
  test: {
    script: [
      'test "$(flac --version)" = "flac {{version}}"',
      'flac $ARG1',
      'flac $ARG2',
    ],
  },
}
