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
    repo: 'go-task/task',
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
      {
        run: 'sed -i \'s/info.Main.Version/"{{version}}"/g\' version.go',
        'working-directory': 'internal/version',
      },
      'go build -o {{prefix}}/bin/task -ldflags="$GO_LDFLAGS" ./cmd/task',
    ],
    env: {
      'GOBIN': '${{prefix}}/bin',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/go-task/task/v3/internal/version.version={{version}}'],
      // Linux needs -buildmode=pie or the resulting binary segfaults.
      // https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': {
        GO_LDFLAGS: ['-s', '-w', '-X github.com/go-task/task/v3/internal/version.version={{version}}', '-buildmode=pie'],
      },
    },
  },
}
