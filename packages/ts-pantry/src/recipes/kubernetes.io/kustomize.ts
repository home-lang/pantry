import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubernetes.io/kustomize',
  name: 'kustomize',
  programs: [
    'kustomize',
  ],
  dependencies: {
    'kubernetes.io/kubectl': '*',
  },
  buildDependencies: {
    'go.dev': '^1.18',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'https://github.com/kubernetes-sigs/kustomize/archive/refs/tags/kustomize/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go install -v -ldflags="$GO_LDFLAGS" ./kustomize',
    ],
    env: {
      GOBIN: '{{prefix}}/bin',
      GO111MODULE: 'on',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=sigs.k8s.io/kustomize/api/provenance.version=kustomize/v{{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'test "$(kustomize version) = {{ version }}"',
      'kustomize build .',
    ],
  },
}
