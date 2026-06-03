import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libpthread-stubs',
  name: 'libpthread-stubs',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://www.x.org/releases/individual/xcb/libpthread-stubs-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion pthread-stubs | grep {{version.marketing}}',
    ],
  },
}
