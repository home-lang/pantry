import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fairwinds.com/pluto',
  name: 'pluto',
  programs: [
    'pluto',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
    'gnu.org/make': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/FairwindsOps/pluto',
  },
  build: {
    script: [
      'make build VERSION=v{{version}}',
      'mkdir -p "{{ prefix }}"/bin',
      'mv pluto "{{ prefix }}"/bin',
    ],
  },
  test: {
    script: [
      'pluto version | grep "Version:v{{version}}"',
    ],
  },
}
