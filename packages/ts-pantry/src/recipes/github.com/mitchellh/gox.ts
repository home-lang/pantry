import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mitchellh/gox',
  name: 'gox',
  programs: [
    'gox',
  ],
  dependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/mitchellh/gox/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/gox',
      ],
    },
  },
  test: {
    script: [
      'wget https://github.com/allaboutapps/go-starter/archive/go-starter-2023-05-03.tar.gz',
      'tar -xz -fgo-starter-2023-05-03.tar.gz',
      'cd ./go-starter-go-starter-2023-05-03',
      'gox -arch amd64 -os darwin -os freebsd',
      'test -x ./go-starter_darwin_amd64',
    ],
  },
}
