import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubebuilder.io',
  name: 'kubebuilder',
  description: 'Kubebuilder - SDK for building Kubernetes APIs using CRDs',
  homepage: 'https://book.kubebuilder.io',
  github: 'https://github.com/kubernetes-sigs/kubebuilder',
  programs: ['kubebuilder'],
  versionSource: {
    type: 'github-releases',
    repo: 'kubernetes-sigs/kubebuilder',
  },
  distributable: {
    url: 'git+https://github.com/kubernetes-sigs/kubebuilder',
  },
  buildDependencies: {
    'go.dev': '~1.25.3', // as of v4.11.1
    'gnu.org/coreutils': '*',
    'goreleaser.com': '*', // as of v4.11.1
  },

  build: {
    script: [
      {
        run: 'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/kubebuilder\' ./cmd',
        if: '<4.5.2',
      },
      {
        run: 'go build -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/kubebuilder\'',
        if: '>=4.5.2<4.11.1',
      },
      {
        run: [
          'rm -rf props',
          'goreleaser build --clean --single-target --skip=validate',
          'install -Dm755 dist/kubebuilder_$(go env GOOS)_$(go env GOARCH)*/kubebuilder \'{{prefix}}/bin/kubebuilder\'',
        ],
        if: '>=4.11.1',
      },
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-X main.kubeBuilderVersion={{version}}', '-X main.goos=$(go env GOOS)', '-X main.goarch=$(go env GOARCH)', '-X main.gitCommit=pkgx', '-X main.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')', '-X sigs.k8s.io/kubebuilder/v4/cmd.kubeBuilderVersion={{version}}', '-X sigs.k8s.io/kubebuilder/v4/cmd.goos=$(go env GOOS)', '-X sigs.k8s.io/kubebuilder/v4/cmd.goarch=$(go env GOARCH)', '-X sigs.k8s.io/kubebuilder/v4/cmd.gitCommit=pkgx', '-X sigs.k8s.io/kubebuilder/v4/cmd.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')'],
    },
  },
}
