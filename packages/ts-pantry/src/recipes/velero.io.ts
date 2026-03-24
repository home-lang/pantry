import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'velero.io',
  name: 'velero',
  description: 'Backup and migrate Kubernetes applications and their persistent volumes',
  homepage: 'https://velero.io/',
  github: 'https://github.com/vmware-tanzu/velero',
  programs: ['velero'],
  versionSource: {
    type: 'github-releases',
    repo: 'vmware-tanzu/velero',
  },
  distributable: {
    url: 'https://github.com/vmware-tanzu/velero/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.23.8',
  },

  build: {
    script: [
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/velero ./cmd/velero',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/vmware-tanzu/velero/pkg/buildinfo.Version=v{{version}}'],
    },
  },
}
