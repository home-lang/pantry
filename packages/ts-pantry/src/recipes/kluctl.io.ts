import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kluctl.io',
  name: 'kluctl',
  description: 'The missing glue to put together large Kubernetes deployments, composed of multiple smaller parts (Helm/Kustomize/...)  in a manageable and unified way.',
  homepage: 'https://kluctl.io',
  github: 'https://github.com/kluctl/kluctl',
  programs: ['kluctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'kluctl/kluctl',
    tagPattern: /^kluctl-v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/kluctl/kluctl/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'nodejs.org': '^18',
    'npmjs.com': '*',
    'gnu.org/make': '*',
  },

  build: {
    script: [
      'make build-webui',
      'go build -v -ldflags="$LDFLAGS" -o bin/kluctl cmd/main.go',
      'mkdir -p "{{ prefix }}"/bin',
      'mv bin/kluctl "{{ prefix }}"/bin',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-extldflags=-static', '-w', '-s', '-X=main.version=v{{version}}'],
    },
  },
}
