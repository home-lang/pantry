import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/abiosoft/colima',
  name: 'colima',
  programs: [
    'colima',
  ],
  dependencies: {
    'lima-vm.io': '*',
  },
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/abiosoft/colima/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/colima',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/abiosoft/colima/config.appVersion={{version}}',
      ],
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/colima',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
