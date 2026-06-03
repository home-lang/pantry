import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/azure-storage-azcopy',
  name: 'azure-storage-azcopy',
  programs: [
    'azcopy',
  ],
  buildDependencies: {
    'go.dev': '>=1.19',
  },
  distributable: {
    url: 'git+https://github.com/Azure/azure-storage-azcopy.git',
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/azcopy',
      ],
      LDFLAGS: [
        '-s',
        '-w',
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
      'azcopy --version | grep {{version}}',
    ],
  },
}
