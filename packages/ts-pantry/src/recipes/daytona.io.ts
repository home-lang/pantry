import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'daytona.io',
  name: 'daytona',
  description: 'The Open Source Dev Environment Manager.',
  homepage: 'https://daytona.io',
  github: 'https://github.com/daytonaio/daytona',
  programs: ['daytona'],
  versionSource: {
    type: 'github-releases',
    repo: 'daytonaio/daytona',
  },
  distributable: {
    url: 'https://github.com/daytonaio/daytona/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.25.4',
  },

  build: {
    script: [
      { run: 'export GONOSUMDB=github.com/daytonaio/daytona', if: '>=0.138.0' },
      { run: 'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/daytona', if: '<0.100' },
      { run: 'go build $ARGS -ldflags="$GO_LDFLAGS" ./apps/cli', if: '>=0.100' },
    ],
    env: {
      'ARGS': ['-trimpath', '-o {{prefix}}/bin/daytona'],
      'linux': {
        ARGS: ['-buildmode=pie'],
      },
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/daytonaio/daytona/internal.Version={{version}}', '-X github.com/daytonaio/daytona-ai-saas/cli/internal.Version={{version}}', '-X github.com/daytonaio/daytona/cli/internal.Version={{version}}'],
    },
  },
}
