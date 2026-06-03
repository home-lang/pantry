import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fluxcd.io/flux2',
  name: 'flux2',
  programs: [
    'flux',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
    'kubernetes.io/kustomize': '^5',
    'gnu.org/make': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/fluxcd/flux2',
  },
  build: {
    script: [
      'make build VERSION={{version}}',
      'mkdir -p {{ prefix }}/bin',
      'mv bin/flux {{ prefix }}/bin',
    ],
  },
  test: {
    script: [
      'test "$(flux --version)" = "flux version {{version}}"',
      'flux install --export > flux-system.yml',
      'test -f flux-system.yml',
    ],
  },
}
