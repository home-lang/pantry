import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cpuguy83/go-md2man',
  name: 'go-md2man',
  programs: [
    'go-md2man',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/cpuguy83/go-md2man/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="-s -w" -o bin/go-md2man',
      'mkdir -p "{{ prefix }}"/bin',
      'mv bin/go-md2man "{{ prefix }}"/bin',
    ],
  },
}
