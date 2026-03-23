import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'kubelinter.io',
  name: 'kube-linter',
  description: 'KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.',
  homepage: 'https://docs.kubelinter.io/',
  github: 'https://github.com/stackrox/kube-linter',
  programs: ['kube-linter'],
  versionSource: {
    type: 'github-releases',
    repo: 'stackrox/kube-linter',
  },
  distributable: {
    url: 'https://github.com/stackrox/kube-linter/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/kube-linter',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-s', '-w', '-X golang.stackrox.io/kube-linter/internal/version.version={{version}}'],
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/kube-linter'],
    },
  },
}
