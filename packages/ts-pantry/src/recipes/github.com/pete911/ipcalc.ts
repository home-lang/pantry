import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/pete911/ipcalc',
  name: 'ipcalc',
  programs: [
    'ipcalc',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/pete911/ipcalc/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'test -f go.mod || go mod init',
      'go mod tidy',
      'go mod vendor',
      'go build ${GO_ARGS} -ldflags="${GO_LDFLAGS}" ./',
    ],
    env: {
      CGO_ENABLED: '0',
      GO_ARGS: [
        '-o {{prefix}}/bin/',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
