import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'budimanjojo.github.io/talhelper',
  name: 'talhelper',
  programs: [
    'talhelper',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/budimanjojo/talhelper/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/talhelper',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/budimanjojo/talhelper/cmd.version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'talhelper --version | grep {{version}}',
      'talhelper gensecret | grep \'bootstraptoken\'',
    ],
  },
}
