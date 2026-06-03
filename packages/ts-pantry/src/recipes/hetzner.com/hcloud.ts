import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hetzner.com/hcloud',
  name: 'hcloud',
  programs: [
    'hcloud',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/hetznercloud/cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -o "{{ prefix }}"/bin/hcloud -v -ldflags="$LDFLAGS" cmd/hcloud/main.go',
    ],
    env: {
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X=github.com/hetznercloud/cli/internal/version.Version={{version}}',
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
      'hcloud version',
      'hcloud version | grep "hcloud {{version}}"',
    ],
  },
}
