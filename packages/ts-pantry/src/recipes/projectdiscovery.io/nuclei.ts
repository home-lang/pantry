import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'projectdiscovery.io/nuclei',
  name: 'nuclei',
  programs: [
    'nuclei',
  ],
  buildDependencies: {
    'go.dev': '~1.22.2',
  },
  distributable: {
    url: 'https://github.com/projectdiscovery/nuclei/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -o {{prefix}}/bin/nuclei -ldflags="$GO_LDFLAGS" ./cmd/nuclei',
    ],
    env: {
      GOBIN: '${{prefix}}/bin',
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
      '(nuclei -scan-all-ips -disable-update-check example.com 2>&1 || true) | tee nuclei.log',
      'grep "No results found" nuclei.log',
      'nuclei --version 2>&1 | tee nuclei.log',
      'grep "{{version}}" nuclei.log',
    ],
  },
}
