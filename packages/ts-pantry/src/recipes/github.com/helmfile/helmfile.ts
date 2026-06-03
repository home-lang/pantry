import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/helmfile/helmfile',
  name: 'helmfile',
  programs: [
    'helmfile',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/helmfile/helmfile',
  },
  build: {
    script: [
      'make build',
      'mkdir -p "{{ prefix }}"/bin',
      'mv ./helmfile "{{ prefix }}"/bin',
    ],
    env: {
      CGO_ENABLED: 0,
      GOFLAGS: '-mod=readonly',
    },
  },
  test: {
    script: [
      'helmfile build -f "${FIXTURE}" | tee /dev/stderr | grep -q "Source: ${FIXTURE}"',
      'helmfile version | tee /dev/stderr | grep -q -w "v{{ version }}"',
    ],
  },
}
