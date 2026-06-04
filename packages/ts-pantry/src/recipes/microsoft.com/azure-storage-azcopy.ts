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
    ref: 'v{{version.raw}}',
  },
  build: {
    // Use GO_LDFLAGS, not the shared $LDFLAGS: buildkit injects C-linker rpath
    // flags into $LDFLAGS which the Go linker rejects. -buildmode=pie is a
    // `go build` flag, not an -ldflags value, so it belongs in ARGS.
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/azcopy',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        ARGS: [
          '-trimpath',
          '-buildmode=pie',
          '-o={{prefix}}/bin/azcopy',
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
