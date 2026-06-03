import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ivmai/libatomic_ops',
  name: 'libatomic_ops',
  programs: [],
  distributable: {
    url: 'https://github.com/ivmai/libatomic_ops/releases/download/v{{version}}/libatomic_ops-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} check',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion atomic_ops | grep {{version}}',
    ],
  },
}
