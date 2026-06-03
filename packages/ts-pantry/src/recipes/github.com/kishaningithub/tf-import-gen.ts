import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kishaningithub/tf-import-gen',
  name: 'tf-import-gen',
  programs: [
    'tf-import-gen',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/kishaningithub/tf-import-gen/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/tf-import-gen',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
    },
  },
  test: {
    script: [
      'tf-import-gen --version',
      'tf-import-gen --version 2>&1 | grep -F "{{version}}"',
    ],
  },
}
