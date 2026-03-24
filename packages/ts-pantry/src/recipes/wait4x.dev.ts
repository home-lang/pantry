import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wait4x.dev',
  name: 'wait4x',
  description: 'Wait4X allows you to wait for a port or a service to enter the requested state.',
  homepage: 'https://wait4x.dev',
  github: 'https://github.com/atkrad/wait4x',
  programs: ['wait4x'],
  versionSource: {
    type: 'github-releases',
    repo: 'atkrad/wait4x',
  },
  distributable: {
    url: 'https://github.com/atkrad/wait4x/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.22',
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/wait4x cmd/wait4x/main.go',
    ],
    env: {
      'GO_ARGS': ['-v', '-trimpath'],
      'GO_LDFLAGS': ['-s', '-w', '-buildid=', '-X wait4x.dev/v2/internal/app/wait4x/cmd.BuildTime=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')', '-X wait4x.dev/v2/internal/app/wait4x/cmd.AppVersion={{version}}'],
    },
  },
}
