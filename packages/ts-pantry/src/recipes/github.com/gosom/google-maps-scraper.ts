import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gosom/google-maps-scraper',
  propsDir: '../../props/github.com/gosom/google-maps-scraper',
  name: 'google-maps-scraper',
  programs: [
    'google-maps-scraper',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21.1',
    'linux/aarch64': {
      'gnu.org/gcc': 14,
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'https://github.com/gosom/google-maps-scraper/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP runner/runner.go',
      },
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS" .',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/google-maps-scraper',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'google-maps-scraper -version | tee out',
      'grep {{version}} out',
    ],
  },
}
