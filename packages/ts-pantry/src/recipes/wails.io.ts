import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wails.io',
  name: 'wails',
  description: 'Create beautiful applications using Go',
  homepage: 'https://wails.io',
  github: 'https://github.com/wailsapp/wails',
  programs: ['wails'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'wailsapp/wails',
  },
  distributable: {
    url: 'https://github.com/wailsapp/wails/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'go.dev': '^1.18',
    'npmjs.com': '*',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o wails ./cmd/wails',
      'install -D wails {{prefix}}/bin/wails',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-extldflags=-static', '-w', '-s'],
    },
  },
}
