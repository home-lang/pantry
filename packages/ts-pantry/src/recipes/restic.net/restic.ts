import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'restic.net/restic',
  name: 'restic',
  programs: [
    'restic',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/restic/restic/releases/download/v{{ version }}/restic-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go run build.go',
      'mkdir -p "{{ prefix }}"/bin',
      'mv restic "{{ prefix }}"/bin',
    ],
  },
}
