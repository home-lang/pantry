import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fly.io',
  name: 'fly',
  description: 'Command line tools for fly.io services',
  homepage: 'https://fly.io',
  github: 'https://github.com/superfly/flyctl',
  programs: ['fly', 'flyctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'superfly/flyctl',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/superfly/flyctl/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o "{{ prefix }}"/bin/flyctl .',
      'cd "{{ prefix }}"/bin',
      'ln -s flyctl fly',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-s', '-w', '-X github.com/superfly/flyctl/internal/buildinfo.environment=production', '-X github.com/superfly/flyctl/internal/buildinfo.buildDate=$(date -u +"%Y-%m-%dT%H:%M:%SZ")', '-X github.com/superfly/flyctl/internal/buildinfo.version={{ version }}', '-X github.com/superfly/flyctl/internal/buildinfo.commit=tea'],
    },
  },
}
