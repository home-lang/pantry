import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'filippo.io/age',
  name: 'age',
  programs: [
    'age',
    'age-keygen',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/FiloSottile/age/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p build/age',
      'go build -o "build/age"  -ldflags "$LDFLAGS" -trimpath ./cmd/...',
      'mkdir -p "{{ prefix }}"/bin',
      'mv build/age/age "{{ prefix }}"/bin',
      'mv build/age/age-keygen "{{ prefix }}"/bin',
    ],
    env: {
      LDFLAGS: [
        '-X main.Version="{{version}}"',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
