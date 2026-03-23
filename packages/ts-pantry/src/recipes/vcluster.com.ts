import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'vcluster.com',
  name: 'vcluster',
  description: 'vCluster - Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the underlying k8s cluster. It\\',
  homepage: 'https://www.vcluster.com',
  github: 'https://github.com/loft-sh/vcluster',
  programs: ['vcluster'],
  versionSource: {
    type: 'github-releases',
    repo: 'loft-sh/vcluster',
  },
  distributable: {
    url: 'git+https://github.com/loft-sh/vcluster.git',
  },
  dependencies: {
    'kubernetes.io/kubectl': '^1',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go generate ./...',
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/vclusterctl/main.go',
    ],
    env: {
      'COMMIT_SHA': '$(git describe --always --abbrev=8 --dirty)',
      'VERSION_DATE': '$(date -u +%FT%TZ)',
      'GO_LDFLAGS': ['-s', '-w', '-X main.commitHash=${COMMIT_SHA}', '-X main.buildDate=${VERSION_DATE}', '-X main.version={{version}}'],
      'ARGS': ['-mod vendor', '-trimpath', '-o={{prefix}}/bin/vcluster'],
    },
  },
}
