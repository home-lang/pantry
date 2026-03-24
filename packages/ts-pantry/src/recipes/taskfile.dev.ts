import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'taskfile.dev',
  name: 'task',
  description: 'A task runner / simpler Make alternative written in Go',
  homepage: 'https://taskfile.dev',
  github: 'https://github.com/go-task/task',
  programs: ['task'],
  versionSource: {
    type: 'github-releases',
    repo: 'go-task/task/releases/tags',
  },
  distributable: {
    url: 'https://github.com/go-task/task/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.23',
  },

  build: {
    script: [
      'cd "internal/version"',
      'sed -i \'s/info.Main.Version/"{{version}}"/g\' version.go',
      'go build -o {{prefix}}/bin/task -ldflags="$GO_LDFLAGS" ./cmd/task',
    ],
    env: {
      'GOBIN': '${{prefix}}/bin',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/go-task/task/v3/internal/version.version={{version}}'],
    },
  },
}
