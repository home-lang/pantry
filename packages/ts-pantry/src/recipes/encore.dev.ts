import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'encore.dev',
  name: 'encore',
  description: 'Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure',
  homepage: 'https://encore.dev',
  github: 'https://github.com/encoredev/encore',
  programs: ['encore', 'git-remote-encore'],
  versionSource: {
    type: 'github-releases',
    repo: 'encoredev/encore',
  },
  distributable: {
    url: 'https://github.com/encoredev/encore/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'encore.dev/go': '^1.21',
  },
  buildDependencies: {
    'go.dev': '~1.23.3',
  },

  build: {
    script: [
      'go mod download',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/encore ./cli/cmd/encore',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/git-remote-encore ./cli/cmd/git-remote-encore',
      // runtime renamed to runtimes in 1.28.0 (https://github.com/encoredev/encore/pull/894)
      { run: 'cp -a runtime "{{prefix}}"', if: '<1.28.0' },
      {
        run: [
          'cp -a runtimes "{{prefix}}"',
          'ln -s runtimes/go "{{prefix}}/runtime"',
        ],
        if: '>=1.28.0',
      },
    ],
    env: {
      'GO111MODULE': 'on',
      'ARGS': ['-v', '-trimpath'],
      'GO_LDFLAGS': ['-s', '-w', '-X \'encr.dev/internal/version.Version={{version}}\''],
      // -buildmode=pie on linux or segmentation fault (arrays supplement the base)
      // https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': {
        GO_LDFLAGS: ['-buildmode=pie'],
      },
    },
  },
}
