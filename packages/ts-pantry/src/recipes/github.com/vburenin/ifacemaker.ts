import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/vburenin/ifacemaker',
  name: 'ifacemaker',
  programs: [
    'ifacemaker',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/vburenin/ifacemaker/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/ifacemaker',
      ],
      LDFLAGS: [
        '-s',
        '-w',
      ],
    },
  },
}
