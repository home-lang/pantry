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
      'gnu.org/gcc': '14',
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'https://github.com/gosom/google-maps-scraper/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // Inject the version at build time (upstream reads it from build info,
      // which is "(devel)" for a source tarball). Replaces the lost pkgx prop.
      {
        run: 'sed -i \'/version := info.Main.Version/a\\\n  if version == "(devel)" {\\\n    version = "{{version}}"\\\n  }\' runner/runner.go',
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
