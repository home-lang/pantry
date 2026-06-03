import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/MaestroError/heif-converter-image',
  name: 'heif-converter-image',
  programs: [
    'heif-converter',
  ],
  dependencies: {
    'github.com/strukturag/libheif': '*',
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/MaestroError/heif-converter-image/archive/refs/tags/0.2.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 1,
      BUILDLOC: '{{prefix}}/bin/heif-converter',
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
      'which heif-converter',
      'heif-converter avif star-wars.avif star-wars.png',
    ],
  },
}
